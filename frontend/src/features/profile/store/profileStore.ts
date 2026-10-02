/**
 * Hồ sơ của chính mình. Giữ trong bộ nhớ — nguồn thật sẽ là `GET /v1/me`.
 */
import { create } from 'zustand';

type ProfileState = {
  name: string | null;
  username: string | null;
  avatarUri: string | null;
  set: (p: { name: string; username: string; avatarUri: string | null }) => void;
};

export const useProfile = create<ProfileState>((set) => ({
  name: null,
  username: null,
  avatarUri: null,
  set: (p) => set(p),
}));
