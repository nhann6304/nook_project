/**
 * Mời, nhận lời, từ chối — gọi server rồi ghi vào kho góc bạn bè.
 *
 * Mời: đánh dấu "đã mời" NGAY, server hỏng thì gỡ ra. Nhận lời: chờ server
 * trả lời rồi mới đưa người vào góc — thêm trước rồi rút ra thì người dùng
 * thấy một người hiện lên rồi biến mất, tệ hơn chờ nửa giây.
 */
import { useCallback, useState } from 'react';
import { translate } from '@i18n';
import { useCircle } from '../store/circleStore';
import { CIRCLE_SIZE, type Person } from '../types';
import { acceptRequest, declineRequest, sendFriendRequest } from './circleApi';

export function useInvites() {
  const markRequested = useCircle((s) => s.markRequested);
  const addFriend = useCircle((s) => s.addFriend);
  const dropIncoming = useCircle((s) => s.dropIncoming);
  const [busy, setBusy] = useState<ReadonlySet<string>>(() => new Set());
  const [error, setError] = useState<string | null>(null);

  const mark = useCallback((id: string, on: boolean) => {
    setBusy((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const request = useCallback(
    async (id: string) => {
      setError(null);
      markRequested(id, true);
      const res = await sendFriendRequest(id);
      if (res.ok) return;
      markRequested(id, false);
      setError(res.message);
    },
    [markRequested],
  );

  const accept = useCallback(
    async (invite: Person) => {
      setError(null);
      if (useCircle.getState().friends.length >= CIRCLE_SIZE) {
        setError(translate('friends.full'));
        return;
      }
      mark(invite.id, true);
      const res = await acceptRequest(invite.id);
      mark(invite.id, false);
      if (!res.ok) {
        setError(res.message);
        return;
      }
      if (!addFriend(invite)) setError(translate('friends.full'));
    },
    [addFriend, mark],
  );

  const decline = useCallback(
    async (id: string) => {
      setError(null);
      mark(id, true);
      const res = await declineRequest(id);
      mark(id, false);
      if (res.ok) dropIncoming(id);
      else setError(res.message);
    },
    [dropIncoming, mark],
  );

  return { busy, error, request, accept, decline };
}
