import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ROLE, looksLikeEmail } from '@nook/shared';
import { Env } from '../../../config/env/index.js';
import { TransactionService } from '../../../core/transaction/index.js';
import {
  UserIdentityRepository,
  UserRepository,
  UserStatRepository,
} from '../../../repository/index.js';

/**
 * Dựng tài khoản quản trị gốc từ biến môi trường `ROOT_ADMIN_EMAIL`.
 *
 * Cách làm này chọn có lý do: **không có API nào phong `root`.** Người đầu tiên
 * phải tới từ bên ngoài hệ thống, nếu không thì gà và trứng — muốn phong admin
 * phải là admin đã. Đưa qua biến môi trường nghĩa là ai nắm được máy chủ mới
 * đặt được, đúng với thực tế: người đó vốn đã nắm mọi thứ rồi.
 *
 * Nó **không tạo mật khẩu**. Tài khoản gốc đăng nhập bằng đúng cửa như mọi
 * người — mã 6 số gửi về email đó. Nên "chiếm được máy chủ" chưa đủ; còn phải
 * đọc được hộp thư nữa.
 *
 * Chạy mỗi lần bật server, và **không sao cả**: có rồi thì thôi, sai vai thì
 * nắn lại. Bỏ biến đó đi thì nó im lặng không làm gì — nhưng cũng KHÔNG hạ vai
 * người đang là root, vì "quên khai biến" không phải là ý muốn tước quyền.
 */
@Injectable()
export class RootAdminService implements OnApplicationBootstrap {
  private readonly log = new Logger('RootAdmin');

  constructor(
    private readonly config: ConfigService<Env, true>,
    private readonly users: UserRepository,
    private readonly identities: UserIdentityRepository,
    private readonly stats: UserStatRepository,
    private readonly tx: TransactionService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const raw = this.config.get('ROOT_ADMIN_EMAIL', { infer: true });
    if (!raw) return;

    const email = raw.trim().toLowerCase();
    if (!looksLikeEmail(email)) {
      this.log.error(`ROOT_ADMIN_EMAIL is not an email: ${raw}`);
      return;
    }

    await this.tx.run(async () => {
      const identity = await this.identities.findByTarget('email', email);

      if (identity) {
        const user = await this.users.findById(identity.userId, { withDeleted: true });
        if (!user) return;
        if (user.role === ROLE.root) return;
        user.role = ROLE.root;
        await this.users.save(user);
        this.log.warn(`promoted existing account to root: ${email}`);
        return;
      }

      // Chưa có thì mở sẵn tài khoản, để lần đăng nhập đầu tiên đã là root —
      // chứ không phải đăng nhập xong rồi mới đi nâng vai bằng tay.
      const user = await this.users.create({ role: ROLE.root });
      await this.stats.create({ userId: user.id });
      await this.identities.insertIfAbsent(user.id, 'email', email);
      this.log.warn(`created root account: ${email}`);
    });
  }
}
