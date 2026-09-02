import { ApiProperty } from '@nestjs/swagger';
import { USER_ROLES, type TUserRole } from '@nook/shared';

/**
 * Người dùng nhìn từ trang quản trị.
 *
 * Là một DTO **khác hẳn** `UserProfileDto` của app, và đó là cả điểm của việc
 * tách hai khán giả: hai bên nhìn cùng một bảng nhưng được thấy hai thứ khác
 * nhau. Ở đây có `role` và `lastSeenAt`; ở app thì không có lý do gì để có.
 *
 * Và ở đây **vẫn không có** cấp thân, không có danh sách bạn bè, không có ai
 * thân với ai. Trang quản trị được biết hệ thống chạy ra sao, không được biết
 * chuyện riêng của người ta.
 */
export class AdminUserDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ enum: USER_ROLES })
  role!: TUserRole;

  @ApiProperty({ nullable: true, example: 'Nam' })
  displayName!: string | null;

  @ApiProperty({ example: true, description: 'Đã qua màn Tên + ảnh' })
  onboarded!: boolean;

  @ApiProperty({ format: 'date-time', nullable: true })
  lastSeenAt!: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;
}
