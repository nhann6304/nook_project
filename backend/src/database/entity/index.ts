import { User, UserIdentity, UserStat } from './user/index.js';
import { Session } from './session/index.js';
import { Achievement, UserAchievement } from './achievement/index.js';
import { Media, MediaVariant } from './media/index.js';

export * from './base/index.js';
export * from './user/index.js';
export * from './session/index.js';
export * from './achievement/index.js';
export * from './media/index.js';

/**
 * Danh sách bảng. Cả Nest và bộ lệnh TypeORM đều đọc mảng này — khai một chỗ
 * để không có chuyện chạy được ở app mà lệnh migration lại không thấy bảng.
 */
export const ENTITIES = [User, UserIdentity, Session, Achievement, UserAchievement, UserStat, Media, MediaVariant];
