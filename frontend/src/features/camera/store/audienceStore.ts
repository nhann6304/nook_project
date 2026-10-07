/**
 * Người xem MẶC ĐỊNH của ảnh mới: danh sách người bị giấu (không phải người
 * được xem) — bạn mới vào góc thì mặc định THẤY, không ai bị bỏ quên. Đổi ở
 * Cài đặt; lúc gửi vẫn chỉnh riêng cho từng tấm.
 */
import { create } from 'zustand';
import { readText, writeText } from '@/lib/storage';

const KEY = 'audience.hidden';

type AudienceState = {
  defaultHidden: readonly string[];
  toggleDefault: (id: string) => void;
  setDefault: (ids: readonly string[]) => void;
  hydrate: () => Promise<void>;
};

export const useAudience = create<AudienceState>((set, get) => ({
  defaultHidden: [],
  toggleDefault: (id) => {
    const cur = get().defaultHidden;
    get().setDefault(cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
  },
  setDefault: (ids) => {
    set({ defaultHidden: ids });
    void writeText(KEY, JSON.stringify(ids));
  },
  hydrate: async () => {
    try {
      const saved = JSON.parse((await readText(KEY)) ?? '[]') as unknown;
      if (Array.isArray(saved)) set({ defaultHidden: saved.filter((x) => typeof x === 'string') });
    } catch {
      // Hỏng thì coi như chưa chọn ai — mặc định là ai cũng thấy.
    }
  },
}));
