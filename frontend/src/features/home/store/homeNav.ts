/**
 * Cầu nối giữa thanh tab và màn chính. "Trang chủ" và "Lướt ảnh" là HAI vị
 * trí của CÙNG một trang lướt (camera ở trang 0, ảnh bạn bè từ trang 1) — chung
 * một camera, không dựng hai màn. Thanh tab xin nhảy, màn chính báo đang ở đâu.
 */
import { create } from 'zustand';

export type HomeSpot = 'camera' | 'feed';

type HomeNav = {
  /** Trang đang xem của màn chính. */
  page: number;
  /** Đang xem lại ảnh vừa chụp — thanh tab mờ đi. */
  reviewing: boolean;
  /** Lần xin nhảy gần nhất; `n` tăng để bấm lại cùng chỗ vẫn chạy. */
  jump: { to: HomeSpot; n: number } | null;
  setPage: (page: number) => void;
  setReviewing: (reviewing: boolean) => void;
  go: (to: HomeSpot) => void;
};

export const useHomeNav = create<HomeNav>((set, get) => ({
  page: 0,
  reviewing: false,
  jump: null,
  setPage: (page) => set({ page }),
  setReviewing: (reviewing) => set({ reviewing }),
  go: (to) => set({ jump: { to, n: (get().jump?.n ?? 0) + 1 } }),
}));
