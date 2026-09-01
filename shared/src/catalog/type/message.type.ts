import type { MSG } from '../constant/index.js';

/** Mọi mã thông báo mà server có thể trả về. */
export type TMsgCode = (typeof MSG)[keyof typeof MSG];
