/**
 * Hai lá cờ "đã xem" của phần làm quen: màn giới thiệu (trước đăng nhập) và
 * tour chỉ nút (lần đầu vào màn Chụp). Ghi xuống máy, không lên server — đổi
 * máy thì xem lại một lần cũng chẳng sao.
 *
 * `ready` giữ splash: không chờ thì người cũ thấy nháy màn giới thiệu một nhịp.
 */
import { create } from 'zustand';
import { readText, writeText } from '@/lib/device/storage';

/** Đổi hậu tố khi nội dung tour đổi hẳn — người cũ được xem bản mới một lần. */
const INTRO_KEY = 'onboarding.intro.v1';
// v2 (12/10/2026): bản cũ ghi "đã xem" cả khi không đo được nút nào — ai dính thì được xem lại.
const TOUR_KEY = 'onboarding.tour.v2';

type OnboardingState = {
  ready: boolean;
  introSeen: boolean;
  tourSeen: boolean;
  /** Tour đang chạy — bật bởi màn Chụp lần đầu hoặc nút "Xem lại hướng dẫn". */
  touring: boolean;
  hydrate: () => Promise<void>;
  finishIntro: () => void;
  startTour: () => void;
  finishTour: () => void;
  /** Tắt mà KHÔNG ghi "đã xem" — màn chưa có nút nào để chỉ, lần sau thử lại. */
  cancelTour: () => void;
};

export const useOnboarding = create<OnboardingState>((set) => ({
  ready: false,
  introSeen: false,
  tourSeen: false,
  touring: false,
  hydrate: async () => {
    const [intro, tour] = await Promise.all([readText(INTRO_KEY), readText(TOUR_KEY)]);
    set({ ready: true, introSeen: intro === '1', tourSeen: tour === '1' });
  },
  finishIntro: () => {
    void writeText(INTRO_KEY, '1');
    set({ introSeen: true });
  },
  startTour: () => {
    if (__DEV__) console.log('[tour] start');
    set({ touring: true });
  },
  cancelTour: () => set({ touring: false }),
  finishTour: () => {
    void writeText(TOUR_KEY, '1');
    set({ tourSeen: true, touring: false });
  },
}));
