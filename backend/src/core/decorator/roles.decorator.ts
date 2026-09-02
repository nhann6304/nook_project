import { SetMetadata } from '@nestjs/common';
import type { TUserRole } from '@nook/shared';

export const REQUIRED_ROLES = 'nook:roles';

/**
 * Đường này chỉ mở cho mấy vai được kể tên.
 *
 *   @Roles(ROLE.admin, ROLE.root)
 *   @Get(API.admin.stats)
 *
 * Không dán gì thì đường đó mở cho mọi người đã đăng nhập — cổng thẻ vẫn chặn
 * người chưa đăng nhập, đó là hai lớp khác nhau: **có phải là ai đó không** và
 * **người đó có được vào đây không**.
 */
export const Roles = (...roles: TUserRole[]) => SetMetadata(REQUIRED_ROLES, roles);
