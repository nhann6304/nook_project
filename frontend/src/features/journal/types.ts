import type { PhotoSource } from '@/features/feed/types';

/** Một tấm mình đã gửi. Nhật ký giữ lâu hơn 48 giờ — đây là của RIÊNG mình. */
export type Entry = { id: string; photo: PhotoSource; caption?: string; at: number };

/** Khoá ngày theo giờ máy: "2026-9-27". Hai tấm cùng khoá là cùng một ô lịch. */
export function dayKey(at: number | Date): string {
  const d = typeof at === 'number' ? new Date(at) : at;
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
