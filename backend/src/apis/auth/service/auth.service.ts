import { HttpStatus, Injectable } from '@nestjs/common';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import {
  ERR,
  isSignInMethodEnabled,
  looksLikeEmail,
  type TRefreshResult,
  type ISendCodeResult,
  type TSignInIntent,
  type TSignInMethod,
  type IVerifyCodeResult,
} from '@nook/shared';
import { AppException } from '../../../core/error/index.js';
import { UserService } from '../../app/user/service/index.js';
import { UserMapper } from '../../app/user/mapper/index.js';
import { CodeSenderService } from '../../../infra/notify/service/index.js';
import { CodeService } from './code.service.js';
import { SessionService } from './session.service.js';
import type { SendCodeDto, VerifyCodeDto, LogoutDto, RefreshDto } from '../dto/index.js';

/**
 * Người dùng gõ số điện thoại không kèm mã nước thì hiểu là số Việt Nam.
 *
 * Đây là một QUYẾT ĐỊNH, không phải mặc định vô thưởng vô phạt. Ngày nào mở
 * sang nước khác thì phải đổi chỗ này VÀ phải đi sửa cả dữ liệu đã lưu.
 */
const DEFAULT_REGION = 'VN';

/**
 * Điều phối luồng đăng nhập.
 *
 * Bản thân nó không tự làm gì nhiều: mã ở `CodeService`, thẻ ở `SessionService`,
 * tài khoản ở `UserService`, gửi đi ở `CodeSenderService`. Chỗ này chỉ xếp thứ
 * tự và quyết định khi nào thì lùi lại.
 *
 * **Hiện chỉ mở đường EMAIL.** Số điện thoại còn chờ chọn nhà mạng gửi SMS —
 * xem `SIGNIN_METHODS_ENABLED` bên `@nook/shared`. App đọc chính danh sách đó
 * để biết vẽ mấy cái nút, nên mở thêm SMS là sửa một chỗ.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly codes: CodeService,
    private readonly sessions: SessionService,
    private readonly users: UserService,
    private readonly userMapper: UserMapper,
    private readonly sender: CodeSenderService,
  ) {}

  /**
   * Xin mã về email hoặc số điện thoại.
   *
   * Giao diện có hai cửa — "đã có tài khoản" và "tạo tài khoản mới" — nên cửa
   * này phải nói được người ta vào nhầm cửa. Đó là một ĐÁNH ĐỔI có thật, ghi
   * ra đây để sau này không ai lặng lẽ gỡ mất vế thứ hai:
   *
   *   được   người gõ email chưa đăng ký ở màn đăng nhập biết ngay tại chỗ,
   *          thay vì chờ một lá thư không bao giờ tới rồi tự đoán vì sao
   *   mất     ai cũng hỏi được "email này có dùng Nook không"
   *   bịt     `guardCaller` — trần theo MÁY GỌI. Hỏi lẻ tẻ thì không sao; quét
   *          cả danh sách thì đụng trần ngay. Không có nó thì việc nói thật ở
   *          đây thành cái máy tra cứu, nên hai thứ đi liền nhau, đừng tách.
   *
   * `intent` bỏ trống thì không soi gì cả, gửi mã cho cả hai trường hợp — cửa
   * cũ vẫn chạy y như trước.
   */
  async sendCode(dto: SendCodeDto, ip: string | null): Promise<ISendCodeResult> {
    const target = this.normalize(dto.method, dto.target);

    // TRƯỚC mọi thứ có thể lộ ra tài khoản có tồn tại hay không. Đặt sau là
    // chốt vẫn còn nguyên trên giấy mà đã cho người ta hỏi xong rồi.
    await this.codes.guardCaller(ip);

    // Và trước `issue` nữa: vào nhầm cửa thì đừng đốt mất chốt 60 giây của
    // người ta cho một mã ta sắp từ chối gửi.
    if (dto.intent) await this.guardIntent(dto.intent, dto.method, target);

    const code = await this.codes.issue(dto.method, target);

    try {
      await this.sender.send(dto.method, target, code);
    } catch {
      // Gửi hỏng thì phải huỷ mã. Không huỷ là người dùng bị chốt 60 giây để
      // chờ một mã không bao giờ tới nơi — và họ sẽ bấm lại, rồi lại bị chặn.
      await this.codes.drop(dto.method, target);
      throw new AppException(ERR.SEND_FAILED, HttpStatus.BAD_GATEWAY);
    }

    return {
      retryAfterSeconds: this.codes.limits.resendSeconds,
      expiresInSeconds: this.codes.limits.ttlSeconds,
      codeLength: this.codes.limits.length,
    } satisfies ISendCodeResult;
  }

  /**
   * Vào đúng cửa chưa.
   *
   * Hai mã trả về là hai màn khác nhau bên app, không phải hai kiểu "lỗi":
   * `account_not_found` -> mời sang màn tạo tài khoản, giữ nguyên email vừa gõ;
   * `account_exists`    -> mời sang màn đăng nhập, cũng giữ nguyên email.
   * Cả hai đều 409: không phải người dùng gõ sai, chỉ là đứng nhầm chỗ.
   */
  private async guardIntent(
    intent: TSignInIntent,
    method: TSignInMethod,
    target: string,
  ): Promise<void> {
    const exists = await this.users.hasIdentity(method, target);

    if (intent === 'signin' && !exists) {
      throw new AppException(ERR.ACCOUNT_NOT_FOUND, HttpStatus.CONFLICT);
    }
    if (intent === 'signup' && exists) {
      throw new AppException(ERR.ACCOUNT_EXISTS, HttpStatus.CONFLICT);
    }
  }

  /** Nộp mã, đổi lấy thẻ phiên. Chưa có tài khoản thì mở luôn tại đây. */
  async verifyCode(dto: VerifyCodeDto, ip: string | null): Promise<IVerifyCodeResult> {
    const target = this.normalize(dto.method, dto.target);

    // Mã đúng TRƯỚC, mở tài khoản SAU. Đảo thứ tự là ai gõ đại một email cũng
    // đẻ ra được một tài khoản rỗng trong bảng.
    await this.codes.consume(dto.method, target, dto.code);

    // Cố ý KHÔNG bọc cả hàm này vào một giao dịch. `findOrCreateByIdentity` có
    // đường thử lại khi thua cuộc đua, mà thử lại được là nhờ giao dịch bên
    // trong nó CUỘN LẠI xong xuôi. Bọc thêm một giao dịch ở ngoài là giữ luôn
    // cái đã cuộn, và đường thử lại chết.

    const { user, isNew } = await this.users.findOrCreateByIdentity(dto.method, target);
    const tokens = await this.sessions.open(user.id, {
      deviceName: dto.deviceName ?? null,
      platform: dto.platform ?? null,
      appVersion: dto.appVersion ?? null,
      ip,
    });

    return {
      ...tokens,
      isNew,
      user: this.userMapper.toDto(user),
    } satisfies IVerifyCodeResult;
  }

  /** Đổi thẻ dài hạn lấy cặp thẻ mới. */
  refresh(dto: RefreshDto): Promise<TRefreshResult> {
    return this.sessions.rotate(dto.refreshToken);
  }

  /** Đăng xuất một máy. */
  logout(dto: LogoutDto): Promise<void> {
    return this.sessions.close(dto.refreshToken);
  }

  /**
   * Đưa đích về DẠNG CHUẨN trước khi làm bất cứ việc gì với nó.
   *
   * "  Nam@Gmail.Com " và "nam@gmail.com" là cùng một người, phải vào cùng một
   * tài khoản. Số điện thoại cũng vậy: "0901234567", "+84901234567",
   * "090 123 4567". Không chuẩn hoá ở đây là để dữ liệu tự chẻ thành ba tài
   * khoản mà không ai hiểu vì sao.
   *
   * Đây là bộ kiểm THẬT. Bộ kiểm bên `@nook/shared` chỉ soi hình dạng để app
   * biết lúc nào cho bấm nút — nó không có `libphonenumber-js`, không biết đầu
   * số nào có thật.
   */
  private normalize(method: TSignInMethod, raw: string): string {
    if (!isSignInMethodEnabled(method)) {
      // Không phải "sai" — là "chưa mở". App cần phân biệt để nói cho đúng.
      throw new AppException(ERR.METHOD_UNAVAILABLE, HttpStatus.BAD_REQUEST);
    }

    if (method === 'email') {
      const value = raw.trim().toLowerCase();
      if (!looksLikeEmail(value)) {
        throw new AppException(ERR.TARGET_INVALID, HttpStatus.BAD_REQUEST);
      }
      return value;
    }

    return this.normalizePhone(raw);
  }

  /**
   * Số điện thoại về E.164: "0901234567", "+84901234567" và "090 123 4567" đều
   * thành `+84901234567`. Một dạng duy nhất cho mọi cách người ta gõ.
   *
   * **Chưa ai gọi tới hàm này** — cổng ở `normalize` chặn đường số điện thoại
   * từ trước. Để sẵn ở đây vì phần khó của SMS không phải chuẩn hoá số, mà là
   * chọn nhà mạng; ngày mở SMS thì chỉ cần thêm `'phone'` vào
   * `SIGNIN_METHODS_ENABLED` và viết một `SmsSender`.
   */
  private normalizePhone(raw: string): string {
    const phone = parsePhoneNumberFromString(raw, DEFAULT_REGION);
    if (!phone?.isValid()) {
      throw new AppException(ERR.TARGET_INVALID, HttpStatus.BAD_REQUEST);
    }
    return phone.number;
  }
}
