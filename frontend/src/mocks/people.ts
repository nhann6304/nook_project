/**
 * Người dùng Nook NGOÀI góc — dữ liệu giả cho ô tìm bạn và lời mời. Xoá khi
 * nối server. Tìm trên Nook chỉ theo @tên riêng — gõ thử: "minh", "@khoa", "an".
 */
import type { Invite, Person } from '@/features/circle/types';

const HOUR = 3_600_000;
const now = Date.now();

export const PEOPLE: readonly Person[] = [
  { id: 'p1', name: 'Minh Anh', username: 'minhanh' },
  { id: 'p2', name: 'Trần Khoa', username: 'khoa.tran' },
  { id: 'p3', name: 'An Nhiên', username: 'annhien' },
  { id: 'p4', name: 'Quốc Bảo', username: 'baoqb' },
  { id: 'p5', name: 'Mai Trâm', username: 'tram.mai' },
  { id: 'p6', name: 'Hoàng Minh', username: 'hminh' },
  { id: 'p7', name: 'Gia Hân', username: 'giahan' },
  { id: 'p8', name: 'Tuấn Lê', username: 'tuan.le' },
];

/** Hai người đã mời mình, đang chờ. */
export const INCOMING: readonly Invite[] = [
  { id: 'p7', name: 'Gia Hân', username: 'giahan', at: now - 2 * HOUR },
  { id: 'p8', name: 'Tuấn Lê', username: 'tuan.le', at: now - 26 * HOUR },
];

/** Trang cá nhân đang khoá — Mai Trâm (ngoài góc) và Linh (trong góc, vẫn thấy đủ). */
export const LOCKED_PROFILES: ReadonlySet<string> = new Set(['p5', 'f4']);

/** Bạn chung giữa mình và từng người. */
export const MUTUAL_FRIENDS: Readonly<Record<string, readonly string[]>> = {
  p1: ['Yến', 'Duy'],
  p2: ['Hưng'],
  p7: ['Yến', 'Hưng', 'Bảo'],
  f1: ['Hưng', 'Duy'],
  f2: ['Yến'],
};
