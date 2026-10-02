/**
 * Hồ sơ của chính mình. Giữ trong bộ nhớ — nguồn thật sẽ là `GET /v1/me`.
 */
import { create } from 'zustand';

type ProfileState = {
  name: string | null;
  username: string | null;
  avatarUri: string | null;
  /** Khoá trang cá nhân: người ngoài góc chỉ thấy tên, ảnh, @tên. */
  locked: boolean;
  set: (p: { name: string; username: string; avatarUri: string | null }) => void;
  setLocked: (locked: boolean) => void;
};

export const useProfile = create<ProfileState>((set) => ({
  name: null,
  username: null,
  avatarUri: null,
  locked: false,
  set: (p) => set(p),
  setLocked: (locked) => set({ locked }),
}));
