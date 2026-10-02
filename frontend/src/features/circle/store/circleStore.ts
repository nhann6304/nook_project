/**
 * Kho góc bạn bè: ai trong góc, ai đang mời mình, mình đã mời ai.
 *
 * Màn chính (viên "N bạn"), màn Bạn bè, trang riêng của một người và Cài đặt
 * cùng đọc một chỗ — nhận lời ở màn Bạn bè là màn chính thấy thêm người ngay.
 *
 * Giữ trong bộ nhớ, chưa lưu xuống đĩa: nguồn thật sẽ là server.
 */
import { create } from 'zustand';
import { FRIENDS } from '@/mocks/friends';
import { INCOMING } from '@/mocks/people';
import { CIRCLE_SIZE, type Friend, type Invite, type Person, type Relation } from '../types';

type CircleState = {
  friends: readonly Friend[];
  incoming: readonly Invite[];
  requested: ReadonlySet<string>;
  /** Thêm vào góc. `false` khi góc đã đầy — người gọi báo cho người dùng. */
  addFriend: (person: Pick<Person, 'id' | 'name' | 'username' | 'uri'>) => boolean;
  dropIncoming: (id: string) => void;
  markRequested: (id: string, on: boolean) => void;
};

export const useCircle = create<CircleState>((set, get) => ({
  friends: FRIENDS,
  incoming: INCOMING,
  requested: new Set(),

  addFriend: (p) => {
    const { friends } = get();
    if (friends.some((f) => f.id === p.id)) return true;
    if (friends.length >= CIRCLE_SIZE) return false;
    const fresh: Friend = {
      id: p.id,
      name: p.name,
      username: p.username,
      uri: p.uri,
      level: 1,
      memories: 0,
      days: 0,
    };
    set((s) => ({
      friends: [fresh, ...s.friends],
      incoming: s.incoming.filter((i) => i.id !== p.id),
    }));
    return true;
  },

  dropIncoming: (id) => set((s) => ({ incoming: s.incoming.filter((i) => i.id !== id) })),

  markRequested: (id, on) =>
    set((s) => {
      const next = new Set(s.requested);
      if (on) next.add(id);
      else next.delete(id);
      return { requested: next };
    }),
}));

/** Quan hệ với một người — dùng cho kết quả tìm. */
export function relationOf(
  id: string,
  s: Pick<CircleState, 'friends' | 'incoming' | 'requested'>,
): Relation {
  if (s.friends.some((f) => f.id === id)) return 'friend';
  if (s.incoming.some((i) => i.id === id)) return 'incoming';
  if (s.requested.has(id)) return 'requested';
  return 'none';
}
