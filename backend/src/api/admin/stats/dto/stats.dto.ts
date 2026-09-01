import { ApiProperty } from '@nestjs/swagger';

/**
 * Mấy con số cho trang thống kê trên web.
 *
 * Chỉ đếm những thứ **không nói gì về một người cụ thể**. Luật sản phẩm của
 * Nook rất kín: không bảng xếp hạng, không số like công khai, cấp thân chỉ hai
 * người trong cặp thấy. Trang quản trị cũng không phải ngoại lệ — nó được biết
 * hệ thống đang chạy ra sao, không được biết ai thân với ai.
 */
export class AdminStatsDto {
  @ApiProperty({ example: 1284, description: 'Tổng người dùng chưa xoá tài khoản' })
  users!: number;

  @ApiProperty({ example: 37, description: 'Mở tài khoản trong 24 giờ qua' })
  newUsersToday!: number;

  @ApiProperty({ example: 902, description: 'Đã qua màn đặt tên' })
  onboardedUsers!: number;

  @ApiProperty({ example: 2, description: 'Số tài khoản có vai quản trị' })
  admins!: number;

  @ApiProperty({ example: 431, description: 'Phiên chưa thu hồi và chưa hết hạn' })
  liveSessions!: number;
}
