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
const TOUR_KEY = 'onboarding.tour.v1';

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
  startTour: () => set({ touring: true }),
  finishTour: () => {
    void writeText(TOUR_KEY, '1');
    set({ tourSeen: true, touring: false });
  },
}));
