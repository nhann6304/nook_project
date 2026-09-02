import { Injectable } from '@nestjs/common';
import { BaseMapper } from '../../../core/mapper/base.mapper.js';
import { User } from '../../../database/entity/user/user.entity.js';
import { AdminUserDto } from './admin-user.dto.js';

/**
 * Bảng `users` → thứ trang quản trị được thấy.
 *
 * Bộ nắn riêng cho khán giả riêng. Dùng chung một bộ nắn cho cả app lẫn web là
 * cách nhanh nhất để một ngày nào đó app trả ra thứ chỉ quản trị mới được thấy.
 */
@Injectable()
export class AdminUserMapper extends BaseMapper<User, AdminUserDto> {
  toDto(user: User): AdminUserDto {
    return {
      id: user.id,
      role: user.role,
      displayName: user.displayName,
      onboarded: user.onboardedAt !== null,
      lastSeenAt: user.lastSeenAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
