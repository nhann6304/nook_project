import type { STAT } from '../../constant/index.js';

/** Tên con đếm mà thành tích canh chừng. Suy ra từ `STAT`, không gõ lại. */
export type TStatKey = (typeof STAT)[keyof typeof STAT];
