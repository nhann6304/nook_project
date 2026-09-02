import { Module } from '@nestjs/common';
import { RepositoryModule } from '../../repository/repository.module.js';
import { AdminStatsController, AdminStatsService } from './stats/index.js';
import {
  AdminUserController,
  AdminUserMapper,
  AdminUserService,
} from './user/index.js';
import { RootAdminService } from './bootstrap/index.js';

/**
 * Cửa cho **web quản trị**. Không phải cho app.
 *
 * Mọi đường ở đây đều `@Roles(ROLE.admin, ROLE.root)` và nằm dưới `/v1/admin/`.
 * Đăng nhập thì vẫn đi qua đúng cửa của mọi người (`/v1/auth/*`) — admin là một
 * người dùng có vai khác, không phải một hệ thống tài khoản thứ hai. Dựng hai
 * hệ thống tài khoản là dựng hai chỗ để hở.
 *
 * Cái mà trang quản trị được biết: hệ thống đang chạy ra sao. Cái nó KHÔNG được
 * biết: ai thân với ai, cấp thân của ai. Luật sản phẩm không có ngoại lệ cho
 * quản trị.
 *
 * Chặng sau thêm vào đây: phong/hạ admin, khoá tài khoản, soi báo cáo vi phạm.
 */
@Module({
  imports: [RepositoryModule],
  controllers: [AdminStatsController, AdminUserController],
  providers: [AdminStatsService, AdminUserService, AdminUserMapper, RootAdminService],
})
export class AdminModule {}
