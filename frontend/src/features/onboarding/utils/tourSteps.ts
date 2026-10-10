/**
 * Thứ tự tour chỉ nút. Nút nào chưa có trên màn (chưa dựng, đang ẩn) thì tour
 * tự nhảy qua — thêm bước ở đây không làm vỡ màn nào.
 */
export const TOUR_TARGETS = [
  'shutter',
  'friends',
  'history',
  'bell',
  'me',
  'memories',
  'chats',
] as const;
export type TourTargetId = (typeof TOUR_TARGETS)[number];

/** Khoá chữ tĩnh để tsc soát được (không ghép chuỗi). */
export const TOUR_COPY = {
  shutter: { title: 'tour.shutterTitle', body: 'tour.shutterBody' },
  friends: { title: 'tour.friendsTitle', body: 'tour.friendsBody' },
  history: { title: 'tour.historyTitle', body: 'tour.historyBody' },
  bell: { title: 'tour.bellTitle', body: 'tour.bellBody' },
  me: { title: 'tour.meTitle', body: 'tour.meBody' },
  memories: { title: 'tour.memoriesTitle', body: 'tour.memoriesBody' },
  chats: { title: 'tour.chatsTitle', body: 'tour.chatsBody' },
} as const satisfies Record<TourTargetId, { title: string; body: string }>;
