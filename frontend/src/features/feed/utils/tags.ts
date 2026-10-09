/**
 * Tag bạn trong chú thích ảnh: chữ "@username" nằm ngay trong chú thích, danh
 * sách người được tag suy ra từ chữ đó lúc gửi. Một nguồn sự thật — xoá chữ
 * "@hung" đi là hết tag Hưng, không có danh sách thứ hai lệch với chữ.
 *
 * Chỉ người đã chung góc mới tag được: chữ "@ai_do" không khớp bạn nào thì chỉ
 * là chữ thường, không ai nhận thông báo.
 */
import { fold } from '@/lib/text/fold';
import type { Tag } from '../types';

/** Một ảnh tag tối đa chừng này người. Hơn nữa là thông báo hàng loạt. */
export const MAX_TAGS = 5;

const MENTION = /@([a-z0-9._]+)/g;

/** Chữ đang gõ dở sau "@" ở CUỐI ô, hoặc `null` nếu không phải đang tag. */
export function mentionAtEnd(text: string): string | null {
  const m = /(?:^|\s)@([^\s@]*)$/.exec(text);
  return m ? (m[1] ?? '') : null;
}

/** Thay "@dở" ở cuối bằng "@username " hoàn chỉnh. */
export function insertMention(text: string, username: string): string {
  return text.replace(/@([^\s@]*)$/, `@${username} `);
}

/** Người được tag trong chú thích, theo thứ tự xuất hiện, không trùng. */
export function tagsIn(caption: string, friends: readonly Tag[]): Tag[] {
  const byName = new Map(friends.map((f) => [f.username, f]));
  const out: Tag[] = [];
  for (const m of caption.matchAll(MENTION)) {
    const f = byName.get(m[1] ?? '');
    if (f && !out.some((t) => t.id === f.id)) out.push(f);
    if (out.length >= MAX_TAGS) break;
  }
  return out;
}

/** Bạn khớp chữ đang gõ sau "@" — theo tên hoặc @tên, bỏ người đã tag. */
export function suggestTags(partial: string, friends: readonly Tag[], taken: readonly Tag[]) {
  const q = fold(partial);
  return friends
    .filter((f) => !taken.some((t) => t.id === f.id))
    .filter((f) => !q || fold(f.username).startsWith(q) || fold(f.name).includes(q))
    .slice(0, MAX_TAGS);
}

export type CaptionPart = { text: string; tag?: Tag };

/** Cắt chú thích thành từng mẩu; mẩu "@username" của người được tag thì kèm `tag`. */
export function splitCaption(caption: string, tags: readonly Tag[] = []): CaptionPart[] {
  if (tags.length === 0) return [{ text: caption }];
  const byName = new Map(tags.map((t) => [t.username, t]));
  const parts: CaptionPart[] = [];
  let last = 0;
  for (const m of caption.matchAll(MENTION)) {
    const tag = byName.get(m[1] ?? '');
    if (!tag || m.index === undefined) continue;
    if (m.index > last) parts.push({ text: caption.slice(last, m.index) });
    parts.push({ text: m[0], tag });
    last = m.index + m[0].length;
  }
  if (last < caption.length) parts.push({ text: caption.slice(last) });
  return parts;
}
