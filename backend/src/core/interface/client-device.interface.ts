/**
 * Cái máy đang gọi, theo lời NÓ tự khai (header `x-device-*` bên `@nook/shared`)
 * cộng `req.ip`. Chỉ để nhận ra máy lạ và ghi dấu vết — KHÔNG BAO GIỜ dùng để
 * cấp quyền: header thì ai cũng gõ được.
 */
export interface IClientDevice {
  /** UUID app tự sinh. Không đúng dạng UUID thì `null`. */
  deviceId: string | null;
  model: string | null;
  os: string | null;
  appVersion: string | null;
  /** `req.ip` — chỉ thật khi `TRUST_PROXY` khai đúng (README mục 9). */
  ip: string | null;
  /**
   * Mã nước do proxy biên gắn (`cf-ipcountry`), CHỈ đọc khi `TRUST_PROXY` có
   * khai — không có proxy thì header này là chữ client tự gõ.
   */
  edgeCountry: string | null;
}
