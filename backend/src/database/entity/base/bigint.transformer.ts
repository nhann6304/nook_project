import type { ValueTransformer } from 'typeorm';

/**
 * Cột `bigint` → `number`. Driver `pg` trả `bigint` về dạng CHUỖI, nên
 * `seq + 1` ra `"41"` — sai mà không ai báo. `seq` của chat còn xa 2^53.
 */
export const BIGINT_AS_NUMBER: ValueTransformer = {
  to: (value: number | null | undefined) => value,
  from: (value: string | number | null) => (value === null ? null : Number(value)),
};
