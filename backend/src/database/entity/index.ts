import { User } from './user.entity.js';
import { UserIdentity } from './user-identity.entity.js';
import { Session } from './session.entity.js';
import { Achievement } from './achievement.entity.js';
import { UserAchievement } from './user-achievement.entity.js';
import { UserStat } from './user-stat.entity.js';

export * from './base.entity.js';
export * from './user.entity.js';
export * from './user-identity.entity.js';
export * from './session.entity.js';
export * from './achievement.entity.js';
export * from './user-achievement.entity.js';
export * from './user-stat.entity.js';

/**
 * Danh sách bảng. Cả Nest và bộ lệnh TypeORM đều đọc mảng này — khai một chỗ
 * để không có chuyện chạy được ở app mà lệnh migration lại không thấy bảng.
 */
export const ENTITIES = [User, UserIdentity, Session, Achievement, UserAchievement, UserStat];
