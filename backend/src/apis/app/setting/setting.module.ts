import { Module } from '@nestjs/common';

/**
 * Cài đặt của người dùng — **khung rỗng, chưa có gì bên trong.**
 *
 * Dựng sẵn để lúc biết cần gì thì nhảy vào code luôn, không phải nghĩ lại chỗ
 * đặt. Khi có việc thật, thư mục sẽ mọc theo đúng khuôn của mọi module khác:
 *
 *   setting/
 *   ├── setting.module.ts
 *   ├── controller/   setting.controller.ts    GET/PATCH /v1/me/settings
 *   ├── service/      setting.service.ts
 *   ├── mapper/       setting.mapper.ts
 *   ├── dto/          update-setting.dto.ts
 *   └── index.ts
 *
 * Bảng thì thêm ở `database/entity/user/user-setting.entity.ts`, kho ở
 * `repository/user/user-setting.repository.ts` — kho nằm NGOÀI thư mục khán
 * giả vì web quản trị rồi cũng sẽ cần đọc.
 *
 * Hai thứ nên chốt trước khi gõ dòng đầu:
 *
 * 1. **Cài đặt của NGƯỜI DÙNG hay của HỆ THỐNG.** Của người dùng (báo thức,
 *    ai xem được gì) thì ở đây, dưới `app/`. Của hệ thống (bật tắt tính năng,
 *    hạn mức) thì thuộc `api/admin/` — hai thứ khác nhau về khán giả lẫn quyền.
 * 2. **Một bảng nhiều cột, hay một bảng khoá-giá-trị.** Nhiều cột thì đọc dễ và
 *    kiểm được kiểu, nhưng thêm cài đặt là thêm migration. Khoá-giá-trị thì
 *    thêm thoải mái, đổi lại mất hết kiểu và mọi chỗ đọc phải tự đoán. Với vài
 *    chục cài đặt thì nhiều cột thắng — đừng chọn khoá-giá-trị chỉ vì nó nghe
 *    linh hoạt hơn.
 *
 * Bảng màu và ngôn ngữ KHÔNG thuộc về đây: chúng nằm trên máy người dùng, xem
 * `frontend/docs/10-theme.md`. Server không cần biết.
 */
@Module({})
export class SettingModule {}
