import type { Socket } from 'socket.io';

/** Một socket vừa vào / rời ống. `changed`: máy ĐẦU TIÊN vào, hoặc máy CUỐI CÙNG rời (tính cả mọi bản server). */
export interface IPresenceChange {
  userId: string;
  online: boolean;
  changed: boolean;
  socket: Socket;
}
