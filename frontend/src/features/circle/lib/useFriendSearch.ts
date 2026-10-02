/**
 * Trạng thái ô tìm bạn: chữ đang gõ, kết quả từ server, ai đã được mời.
 *
 * Chờ người ta ngừng gõ 300ms mới hỏi server, và chỉ nhận câu trả lời của lần
 * gõ MỚI NHẤT — mạng chậm thì câu trả lời cũ về sau, không có chặn này là danh
 * sách nhảy về kết quả của chữ đã xoá.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Person } from '../types';
import { MIN_QUERY, searchPeople, sendFriendRequest } from './circleApi';
import { fold } from './fold';

const DEBOUNCE = 300;

export function useFriendSearch() {
  const [query, setQuery] = useState('');
  const [people, setPeople] = useState<readonly Person[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requested, setRequested] = useState<ReadonlySet<string>>(() => new Set());
  const latest = useRef(0);

  // Trạng thái "đang tìm" đặt ngay lúc gõ; effect chỉ lo hẹn giờ hỏi server.
  const change = useCallback((q: string) => {
    setQuery(q);
    const long = fold(q).length >= MIN_QUERY;
    setSearching(long);
    if (!long) {
      setPeople([]);
      setError(null);
    }
  }, []);

  useEffect(() => {
    const ticket = ++latest.current;
    if (fold(query).length < MIN_QUERY) return;
    const timer = setTimeout(() => {
      void searchPeople(query).then((res) => {
        if (ticket !== latest.current) return;
        setSearching(false);
        if (res.ok) {
          setPeople(res.people);
          setError(null);
        } else {
          setError(res.message);
        }
      });
    }, DEBOUNCE);
    return () => clearTimeout(timer);
  }, [query]);

  // Đánh dấu "đã mời" NGAY, server hỏng thì gỡ ra — bấm xong không phải chờ.
  const request = useCallback(async (id: string) => {
    setRequested((prev) => new Set(prev).add(id));
    const res = await sendFriendRequest(id);
    if (res.ok) return;
    setRequested((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setError(res.message);
  }, []);

  return { query, setQuery: change, people, searching, error, requested, request };
}
