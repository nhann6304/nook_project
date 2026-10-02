/**
 * Âm thanh — một cửa duy nhất, giống `haptics.ts`.
 *
 * Đúng ba tiếng, gọi theo VIỆC: chụp, gửi xong, thả cảm xúc. Không có tiếng
 * cho nút thường, chuyển màn, gõ phím — app kêu ở mọi chỗ là app người ta tắt
 * tiếng, mất luôn ba tiếng đáng có.
 *
 * Ba luật để không thành phiền:
 *   · `mixWithOthers`: KHÔNG dừng nhạc người dùng đang nghe;
 *   · iPhone gạt im lặng thì im (`playsInSilentMode: false`);
 *   · tắt được trong Cài đặt, và nhớ lựa chọn đó.
 *
 * Tệp âm thanh tự tổng hợp (assets/sounds), mỗi tệp vài KB, không bản quyền.
 */
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { readText, writeText } from './storage';

const KEY = 'sound';
const VOLUME = 0.6;

const SOURCES = {
  capture: require('../../assets/sounds/shutter.wav'),
  sent: require('../../assets/sounds/send.wav'),
  reacted: require('../../assets/sounds/pop.wav'),
} as const;

type Name = keyof typeof SOURCES;

let enabled = true;
let players: Partial<Record<Name, AudioPlayer>> = {};

/** Gọi một lần lúc mở app. Hỏng thì app vẫn chạy, chỉ là không có tiếng. */
export async function initSound(): Promise<boolean> {
  try {
    enabled = (await readText(KEY)) !== 'off';
    await setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' });
    players = Object.fromEntries(
      (Object.keys(SOURCES) as Name[]).map((n) => {
        const p = createAudioPlayer(SOURCES[n]);
        p.volume = VOLUME;
        return [n, p];
      }),
    );
  } catch {
    players = {};
  }
  return enabled;
}

export function isSoundEnabled(): boolean {
  return enabled;
}

export function setSoundEnabled(on: boolean): void {
  enabled = on;
  void writeText(KEY, on ? 'on' : 'off');
}

function play(name: Name) {
  const p = players[name];
  if (!enabled || !p) return;
  try {
    // Phát lại từ đầu: bấm hai lần liền thì nghe hai tiếng, không phải nửa tiếng.
    void p.seekTo(0).then(() => p.play());
  } catch {
    /* thiếu tiếng không được làm hỏng thao tác */
  }
}

/** Bấm nút chụp. */
export const capture = () => play('capture');
/** Ảnh đã gửi xong. */
export const sent = () => play('sent');
/** Thả một cảm xúc cho ảnh của bạn. */
export const reacted = () => play('reacted');
