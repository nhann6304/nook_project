import { ApiProperty } from '@nestjs/swagger';
import type { IUserProfile } from '@nook/shared';

/**
 * Hồ sơ của CHÍNH MÌNH.
 *
 * Nằm ở `common/` chứ không nằm trong `model/user/` vì cả cửa đăng nhập lẫn
 * cửa hồ sơ đều trả về nó — đó đúng là nghĩa của "chung".
 *
 * Chưa có "hồ sơ người khác". Tới chặng góc bạn bè mới có, và nó sẽ là một lớp
 * KHÁC, hẹp hơn: luật sản phẩm cấm trả cấp thân của người khác cho người thứ ba.
 */
export class UserProfileDto implements IUserProfile {
  @ApiProperty({ format: 'uuid', example: '6f1b7a2e-0c3d-4a1f-9d8e-2b5c7a9f1e34' })
  id!: string;

  @ApiProperty({ nullable: true, maxLength: 24, example: 'Nam' })
  displayName!: string | null;

  @ApiProperty({ nullable: true, description: 'Đường dẫn đã ký, hết hạn sau vài phút' })
  avatarUrl!: string | null;

  @ApiProperty({ example: false, description: 'Đã qua màn Tên + ảnh chưa' })
  onboarded!: boolean;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;
}
