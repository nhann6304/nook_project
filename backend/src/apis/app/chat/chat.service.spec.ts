import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpStatus } from '@nestjs/common';
import type { DataSource } from 'typeorm';
import { CHAT_SOCKET_OUT, ERR } from '@nook/shared';
import { AppException } from '../../../core/error/app.exception.js';
import { TransactionService } from '../../../core/transaction/transaction.service.js';
import type { ChatMessage } from '../../../database/entity/index.js';
import { ChatMapper } from './chat.mapper.js';
import { ChatService } from './chat.service.js';

/**
 * Luật của `send()` — kho là hàng GIẢ trong bộ nhớ, cố ý: cái cần chứng minh là
 * thứ tự quyết định (gửi lại, cấp số, thua cuộc đua), không phải Postgres.
 * Phần SQL thật (khoá dòng, ON CONFLICT) đã chạy qua bằng server thật.
 */

const CHAT = 'c0000000-0000-4000-8000-000000000001';
const OTHER_CHAT = 'c0000000-0000-4000-8000-000000000002';
const A = 'a0000000-0000-4000-8000-00000000000a';
const B = 'b0000000-0000-4000-8000-00000000000b';
const STRANGER = 'f0000000-0000-4000-8000-00000000000f';

function world() {
  const chats = new Map<string, { lastSeq: number }>([
    [CHAT, { lastSeq: 0 }],
    [OTHER_CHAT, { lastSeq: 0 }],
  ]);
  const members = [
    { chatId: CHAT, userId: A, lastReadSeq: 0 },
    { chatId: CHAT, userId: B, lastReadSeq: 0 },
    { chatId: OTHER_CHAT, userId: B, lastReadSeq: 0 },
    { chatId: OTHER_CHAT, userId: STRANGER, lastReadSeq: 0 },
  ];
  const rows: ChatMessage[] = [];
  let ids = 0;

  const chatRepo = {
    nextSeq: vi.fn(async (id: string) => {
      const c = chats.get(id);
      return c ? ++c.lastSeq : null;
    }),
    undoSeq: vi.fn(async (id: string) => {
      chats.get(id)!.lastSeq -= 1;
    }),
    exists: async ({ id }: { id: string }) => chats.has(id),
  };
  const memberRepo = {
    findMember: async (chatId: string, userId: string) =>
      members.find((m) => m.chatId === chatId && m.userId === userId) ?? null,
    membersOf: async (chatId: string) => members.filter((m) => m.chatId === chatId),
  };
  const find = (chatId: string, senderId: string, clientId: string) =>
    rows.find((r) => r.chatId === chatId && r.senderId === senderId && r.clientId === clientId) ?? null;
  const messageRepo = {
    findByClientId: vi.fn(async (c: string, s: string, k: string) => find(c, s, k)),
    findOne: async (w: { id: string; chatId: string }) =>
      rows.find((r) => r.id === w.id && r.chatId === w.chatId) ?? null,
    // Như `ON CONFLICT (chat_id, sender_id, client_id) DO NOTHING`.
    insertOnce: vi.fn(async (row: Omit<ChatMessage, 'id' | 'createdAt'>) => {
      if (find(row.chatId, row.senderId, row.clientId)) return null;
      const made = { ...row, id: `m${++ids}`, createdAt: new Date('2026-10-09T00:00:00Z') } as ChatMessage;
      rows.push(made);
      return made;
    }),
  };
  const media = {
    mine: vi.fn(async (_owner: string, id: string) => ({
      id,
      status: id.endsWith('1') ? 'ready' : 'pending',
      contentType: 'image/heic',
    })),
  };
  const realtime = { toUsers: vi.fn(), toUser: vi.fn() };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const any = (x: unknown) => x as any;
  const service = new ChatService(
    any(chatRepo),
    any(memberRepo),
    any(messageRepo),
    any({}),
    any(media),
    new ChatMapper(),
    any(realtime),
  );
  return { service, chats, rows, chatRepo, messageRepo, realtime };
}

async function codeOf(work: Promise<unknown>): Promise<[string, number]> {
  try {
    await work;
  } catch (error) {
    if (error instanceof AppException) return [error.code, error.getStatus()];
    throw error;
  }
  throw new Error('expected an AppException');
}

describe('ChatService.send', () => {
  beforeAll(() => {
    // `@Transactional()` cần một TransactionService đã dựng; giao dịch giả chỉ chạy thẳng.
    const fake = { transaction: (work: (m: unknown) => Promise<unknown>) => work({}) };
    new TransactionService(fake as unknown as DataSource);
  });

  let w: ReturnType<typeof world>;
  beforeEach(() => {
    w = world();
  });

  it('seq tăng dần trong một cuộc, và bắn cho CẢ HAI người', async () => {
    const one = await w.service.send(A, CHAT, { clientId: 'k1', kind: 'text', body: 'chào' });
    const two = await w.service.send(B, CHAT, { clientId: 'k1', kind: 'text', body: 'ơi' });

    expect([one.seq, two.seq]).toEqual([1, 2]);
    expect(w.chats.get(CHAT)!.lastSeq).toBe(2);
    expect(w.realtime.toUsers).toHaveBeenCalledWith([A, B], CHAT_SOCKET_OUT.message, one);
  });

  it('gửi lại cùng clientId: trả ĐÚNG tin cũ, không cấp số mới, không bắn lại', async () => {
    const first = await w.service.send(A, CHAT, { clientId: 'retry-1', kind: 'text', body: 'alo' });
    const again = await w.service.send(A, CHAT, { clientId: 'retry-1', kind: 'text', body: 'alo' });

    expect(again).toEqual(first);
    expect(w.rows).toHaveLength(1);
    expect(w.chats.get(CHAT)!.lastSeq).toBe(1);
    expect(w.realtime.toUsers).toHaveBeenCalledTimes(1);
  });

  it('thua cuộc đua với một lần gửi lại song song: trả số đã lấy và trả tin của bên thắng', async () => {
    const winner = await w.service.send(A, CHAT, { clientId: 'race', kind: 'text', body: 'x' });
    // Lần thứ hai không thấy tin ở bước soi đầu (bên kia chưa commit lúc đó)...
    w.messageRepo.findByClientId.mockResolvedValueOnce(null);

    const loser = await w.service.send(A, CHAT, { clientId: 'race', kind: 'text', body: 'x' });

    expect(loser.id).toBe(winner.id);
    expect(w.chatRepo.undoSeq).toHaveBeenCalledWith(CHAT);
    expect(w.chats.get(CHAT)!.lastSeq).toBe(1);
    expect(w.rows).toHaveLength(1);
  });

  it('cùng clientId ở hai NGƯỜI khác nhau là hai tin khác nhau', async () => {
    await w.service.send(A, CHAT, { clientId: 'same', kind: 'text', body: '1' });
    await w.service.send(B, CHAT, { clientId: 'same', kind: 'text', body: '2' });
    expect(w.rows).toHaveLength(2);
  });

  it('người ngoài cuộc bị chặn: chat.not_member (403), không cấp số', async () => {
    const [code, status] = await codeOf(
      w.service.send(A, OTHER_CHAT, { clientId: 'k', kind: 'text', body: 'hi' }),
    );
    expect([code, status]).toEqual([ERR.CHAT_NOT_MEMBER, HttpStatus.FORBIDDEN]);
    expect(w.chatRepo.nextSeq).not.toHaveBeenCalled();
  });

  it('cuộc không tồn tại: chat.not_found (404)', async () => {
    const [code, status] = await codeOf(
      w.service.send(A, 'c0000000-0000-4000-8000-0000000000ff', { clientId: 'k', kind: 'text', body: 'hi' }),
    );
    expect([code, status]).toEqual([ERR.CHAT_NOT_FOUND, HttpStatus.NOT_FOUND]);
  });

  it('soi hình dạng tin TRƯỚC khi cấp số', async () => {
    expect((await codeOf(w.service.send(A, CHAT, { clientId: 'e', kind: 'text', body: '   ' })))[0]).toBe(
      ERR.CHAT_EMPTY_MESSAGE,
    );
    expect(
      (await codeOf(w.service.send(A, CHAT, { clientId: 's', kind: 'sticker', body: 'Bad Sticker!' })))[0],
    ).toBe(ERR.CHAT_BAD_STICKER);
    expect(
      (await codeOf(w.service.send(A, CHAT, { clientId: 'i', kind: 'image', mediaId: 'media-2' })))[0],
    ).toBe(ERR.MEDIA_NOT_UPLOADED);
    expect(w.chatRepo.nextSeq).not.toHaveBeenCalled();
  });

  it('ảnh đã tải xong của chính mình thì gửi được, `mediaId` là ảnh gốc', async () => {
    const msg = await w.service.send(A, CHAT, { clientId: 'img', kind: 'image', mediaId: 'media-1' });
    expect(msg).toMatchObject({ kind: 'image', mediaId: 'media-1', body: null, seq: 1 });
  });
});
