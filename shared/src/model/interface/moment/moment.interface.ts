// ── POST /v1/moments ────────────────────────────────────────────────────────
//
// CHƯA có bên server (module `moment`, tầng 2). App đã gọi đúng hình này qua
// `frontend/src/features/feed/lib/momentApi.ts` — server dựng theo đây là khớp.

export interface ICreateMomentBody {
  /** Ảnh (hoặc ảnh bìa của video) đã tải lên xong, `kind: 'moment'`. */
  photoMediaId: string;
  /** Video ngắn, ≤ `MEDIA_LIMITS.videoMaxSeconds`. */
  videoMediaId?: string;
  caption?: string;
  /** Người được tag — chỉ người trong góc, server soi lại. */
  tagUserIds?: string[];
  /**
   * Người trong góc KHÔNG được xem tấm này (mặc định ai trong góc cũng xem).
   * Server lọc khi phát; người bị tag mà nằm ở đây thì cũng không thấy.
   */
  hiddenFromUserIds?: string[];
}

export interface ICreateMomentResult {
  id: string;
  createdAt: string;
}
