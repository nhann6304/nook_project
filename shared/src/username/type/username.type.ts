import type { USERNAME_ERR } from '../constant/index.js';

/** Vì sao một tên không dùng được. `null` nghĩa là dùng được. */
export type TUsernameProblem = (typeof USERNAME_ERR)[keyof typeof USERNAME_ERR] | null;
