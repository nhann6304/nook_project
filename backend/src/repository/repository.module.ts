import { Global, Module } from '@nestjs/common';
import {
  UserIdentityRepository,
  UserRepository,
  UserStatRepository,
} from './user/index.js';
import { SessionRepository } from './session/index.js';
import { AchievementRepository, UserAchievementRepository } from './achievement/index.js';

const REPOSITORIES = [
  UserRepository,
  UserIdentityRepository,
  UserStatRepository,
  SessionRepository,
  AchievementRepository,
  UserAchievementRepository,
];

/**
 * Kho dữ liệu, phát cho mọi khán giả.
 *
 * `@Global` vì kho **không thuộc về khán giả nào**: app React Native và web
 * quản trị hỏi cùng một bảng `users`. Bắt mỗi module import lại một danh sách
 * kho là chép đi chép lại cùng một thứ, và rồi sẽ có chỗ chép thiếu.
 *
 * Kho ở đây không mang trạng thái — nó hỏi `TransactionContext` lúc dùng chứ
 * không ôm sẵn một `Repository`. Nhờ vậy dùng chung một thể mới an toàn.
 */
@Global()
@Module({
  providers: REPOSITORIES,
  exports: REPOSITORIES,
})
export class RepositoryModule {}
