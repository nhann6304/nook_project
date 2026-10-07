// ── GET / PATCH /v1/me/settings ─────────────────────────────────────────────
//
// CHƯA có bên server (module `setting`, tầng 1 — thư mục đã có, còn rỗng).
// App chỉ gọi PATCH khi người dùng bấm "Lưu" ở một trang cài đặt, không gọi
// mỗi lần chạm — chạm qua chạm lại là trăm lệnh ghi cho một quyết định.
// Giá trị màu / ngôn ngữ là chuỗi app tự hiểu; server chỉ cất và trả lại.

export interface ISettings {
  /** 'sky' | 'light' | 'dark' | 'system' */
  themeMode: string;
  /** Màu locket: 'denim' | 'rose' | 'sage' | 'lavender' | 'apricot' */
  accent: string;
  /** 'vi' | 'en' | null = theo máy */
  locale: string | null;
  sound: boolean;
  profileLocked: boolean;
  /** Người trong góc mặc định KHÔNG thấy ảnh mới. */
  hiddenFromDefault: string[];
}

/** PATCH chỉ gửi những gì đổi. */
export interface IUpdateSettingsBody extends Partial<ISettings> {}
