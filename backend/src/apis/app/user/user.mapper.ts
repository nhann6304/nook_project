import { Injectable } from '@nestjs/common';
import { API, path } from '@nook/shared';
import { BaseMapper } from '../../../core/mapper/base.mapper.js';
import { UserProfileDto } from '../../../core/dto/user-profile.dto.js';
import { User } from '../../../database/entity/user/user.entity.js';

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
      role: user.role,
      username: user.username,
      displayName: user.displayName,
      // Đường của SERVER, không phải đường đã ký của kho. Đường ký hết hạn sau
      // vài phút, nên để nó vào một câu trả lời mà app lưu lại là để một thứ
      // hỏng sẵn. `/v1/media/<id>` thì ổn định, và mỗi lần tải là một lần ký
      // lại — quyền xem được kiểm đúng lúc xem, không phải lúc tạo câu trả lời.
      avatarUrl: user.avatarMediaId ? path(API.media.read, { id: user.avatarMediaId }) : null,
      onboarded: user.onboardedAt !== null,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
