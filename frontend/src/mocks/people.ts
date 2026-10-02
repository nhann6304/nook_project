/**
 * Người dùng Nook NGOÀI góc — dữ liệu giả cho ô tìm bạn. Xoá khi nối server.
 * Gõ thử: "an", "minh", "@khoa", "tran".
 */
import type { Person } from '@/features/circle/types';

export const PEOPLE: readonly Person[] = [
  { id: 'p1', name: 'Minh Anh', username: 'minhanh' },
  { id: 'p2', name: 'Trần Khoa', username: 'khoa.tran' },
  { id: 'p3', name: 'An Nhiên', username: 'annhien' },
  { id: 'p4', name: 'Quốc Bảo', username: 'baoqb' },
  { id: 'p5', name: 'Mai Trâm', username: 'tram.mai' },
  { id: 'p6', name: 'Hoàng Minh', username: 'hminh' },
];
