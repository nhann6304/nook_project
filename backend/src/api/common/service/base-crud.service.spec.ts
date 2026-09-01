import { describe, expect, it } from 'vitest';
import { ERR } from '@nook/shared';
import { AppException } from '../error/index.js';
import { BaseMapper } from '../mapper/index.js';
import { BaseCrudService } from './base-crud.service.js';

/**
 * Bài kiểm cho tầng dùng chung.
 *
 * Kho ở đây là hàng GIẢ, cố ý: cái cần chứng minh là `BaseCrudService` xử đúng
 * — nắn đúng chỗ, không thấy thì ném đúng mã, xoá thì chọn đúng kiểu xoá. Đó là
 * chuyện của nó, không phải chuyện của Postgres. Phần chạm cơ sở dữ liệu thật
 * đã có `scripts/smoke-auth.sh` đi qua.
 */

type Row = { id: string; name: string; createdAt: Date };
type RowDto = { id: string; name: string };

class RowMapper extends BaseMapper<Row, RowDto> {
  toDto(row: Row): RowDto {
    return { id: row.id, name: row.name };
  }
}

/** Kho giả: đủ mặt để `BaseCrudService` chạy, và ghi lại nó đã gọi những gì. */
function fakeRepo(rows: Row[], softDelete = false) {
  const calls: string[] = [];
  return {
    calls,
    supportsSoftDelete: () => softDelete,
    findById: async (id: string) => rows.find((r) => r.id === id) ?? null,
    find: async () => rows,
    create: async (data: Partial<Row>) => {
      calls.push('create');
      const made = { id: 'made', name: '', createdAt: new Date(0), ...data } as Row;
      rows.push(made);
      return made;
    },
    update: async (_where: unknown, patch: Partial<Row>) => {
      calls.push('update');
      const row = rows[0];
      if (row) Object.assign(row, patch);
      return 1;
    },
    delete: async () => {
      calls.push('delete');
      return 1;
    },
    softDelete: async () => {
      calls.push('softDelete');
      return 1;
    },
    pageByCursor: async (input: { cursor?: string; limit: number }) => {
      calls.push(`page:${input.cursor ?? '-'}:${input.limit}`);
      return { items: rows.slice(0, input.limit), nextCursor: 'con-tro-tiep' };
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const build = (repo: any, notFound?: () => never) =>
  new (class extends BaseCrudService<Row, RowDto> {
    constructor() {
      super(repo, new RowMapper());
      void notFound;
    }
  })();

const ROW: Row = { id: 'r1', name: 'Nam', createdAt: new Date('2026-09-01T00:00:00Z') };

describe('BaseCrudService', () => {
  it('tạo xong thì trả về DTO, không trả nguyên bản ghi', async () => {
    const repo = fakeRepo([]);
    const dto = await build(repo).create({ name: 'Nam' });
    expect(repo.calls).toContain('create');
    expect(dto).toEqual({ id: 'made', name: 'Nam' });
    expect(dto).not.toHaveProperty('createdAt');
  });

  it('không tìm thấy thì ném đúng mã, không trả null', async () => {
    const service = build(fakeRepo([]));
    await expect(service.findById('khong-co')).rejects.toBeInstanceOf(AppException);
    await expect(service.findById('khong-co')).rejects.toMatchObject({ code: ERR.NOT_FOUND });
  });

  it('lớp con đè được mã lỗi để nói đúng miền', async () => {
    class Userish extends BaseCrudService<Row, RowDto> {
      constructor() {
        super(fakeRepo([]) as never, new RowMapper());
      }
      protected override notFoundCode() {
        return ERR.USER_NOT_FOUND;
      }
    }
    await expect(new Userish().findById('x')).rejects.toMatchObject({ code: ERR.USER_NOT_FOUND });
  });

  it('bảng xoá mềm được thì ĐÁNH DẤU, không xoá thật', async () => {
    const repo = fakeRepo([{ ...ROW }], true);
    await build(repo).remove('r1');
    expect(repo.calls).toContain('softDelete');
    expect(repo.calls).not.toContain('delete');
  });

  it('bảng không xoá mềm được thì xoá thật', async () => {
    const repo = fakeRepo([{ ...ROW }], false);
    await build(repo).remove('r1');
    expect(repo.calls).toContain('delete');
    expect(repo.calls).not.toContain('softDelete');
  });

  it('xoá thứ không tồn tại thì ném, không im lặng báo xong', async () => {
    const repo = fakeRepo([], true);
    await expect(build(repo).remove('khong-co')).rejects.toBeInstanceOf(AppException);
    expect(repo.calls).toHaveLength(0);
  });

  it('lật trang thì chuyển con trỏ xuống kho và nắn từng dòng', async () => {
    const repo = fakeRepo([{ ...ROW }, { ...ROW, id: 'r2' }]);
    const page = await build(repo).page({ cursor: 'c0', limit: 1 });
    expect(repo.calls).toContain('page:c0:1');
    expect(page.items).toEqual([{ id: 'r1', name: 'Nam' }]);
    expect(page.nextCursor).toBe('con-tro-tiep');
  });
});
