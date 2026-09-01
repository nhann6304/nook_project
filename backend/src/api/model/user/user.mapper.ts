import { Injectable } from '@nestjs/common';
import { BaseMapper } from '../../common/mapper/base.mapper.js';
import { UserProfileDto } from '../../common/dto/user-profile.dto.js';
import { User } from '../../../database/entity/index.js';

/**
 * Bảng `users` → thứ người dùng được thấy về CHÍNH MÌNH.
 *
 * Chỗ duy nhất quyết định cột nào ra ngoài. Cứ để việc này nằm rải trong dịch
 * vụ thì sớm muộn có một cửa trả nguyên entity — kèm `deleted_at`, kèm mọi cột
 * mà lúc thêm vào không ai nghĩ tới chuyện nó sẽ đi ra ngoài.
 *
 * Chưa có bản nắn cho "hồ sơ người khác". Tới chặng góc bạn bè mới có, và nó
 * phải là một bản KHÁC, hẹp hơn — luật sản phẩm cấm để lộ cấp thân của người
 * khác cho người thứ ba, và chỗ chặn được là đây.
 */
@Injectable()
export class UserMapper extends BaseMapper<User, UserProfileDto> {
  toDto(user: User): UserProfileDto {
    return {
      id: user.id,
      displayName: user.displayName,
      // TODO(chặng ảnh): ký đường dẫn từ `user.avatarKey`. Không lưu sẵn đường
      // dẫn đã ký vào bảng — nó hết hạn sau vài phút, lưu là lưu một thứ hỏng.
      avatarUrl: null,
      onboarded: user.onboardedAt !== null,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
