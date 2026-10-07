/**
 * Lưu cài đặt lên server — gọi MỘT lần khi bấm "Lưu", không gọi mỗi lần chạm.
 *
 * Trên máy luôn áp dụng ngay (người gọi lo); server chỉ là bản sao để đổi máy
 * vẫn còn. `LIVE`: `PATCH /v1/me/settings` theo `IUpdateSettingsBody` của
 * `@nook/shared` — server CHƯA có module `setting`, hỏng thì máy vẫn giữ.
 */
import { API } from '@nook/shared/common/constant';
import type { ISettings, IUpdateSettingsBody } from '@nook/shared/model/interface';
import { translateError } from '@i18n';
import { LIVE, call } from '@/lib/api';

export type SaveSettingsResult = { ok: true } | { ok: false; message: string };

export async function saveSettings(patch: IUpdateSettingsBody): Promise<SaveSettingsResult> {
  if (!LIVE) return { ok: true };
  const res = await call<ISettings>('PATCH', API.setting.mine, patch);
  return res.ok ? { ok: true } : { ok: false, message: translateError(res.code) };
}
