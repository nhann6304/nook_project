import { Module } from '@nestjs/common';

/**
 * Cài đặt người dùng — khung rỗng, dựng sẵn để lúc cần thì nhảy vào code luôn.
 *
 * Hai thứ chốt trước khi gõ dòng đầu:
 * - Cài đặt của NGƯỜI DÙNG ở đây; của HỆ THỐNG thuộc `admin/`.
 * - Nhiều cột thắng khoá-giá-trị ở quy mô vài chục cài đặt: giữ được kiểu.
 *
 * Bảng màu và ngôn ngữ không thuộc về đây — chúng nằm trên máy người dùng.
 */
@Module({})
export class SettingModule {}
