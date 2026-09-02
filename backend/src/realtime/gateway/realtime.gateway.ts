import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Namespace, Socket } from 'socket.io';
import { SOCKET, SOCKET_IN, SOCKET_OUT } from '@nook/shared';
import { SessionService } from '../../api/auth/service/index.js';

/** Mỗi người một phòng riêng. Bắn tin cho một người là bắn vào phòng của họ. */
const room = (userId: string) => `user:${userId}`;

/**
 * Ống realtime.
 *
 * **Đây là ĐƯỜNG TẮT, không phải lời hứa giao hàng.** App bị đẩy ra nền là ống
 * đứt, và nó đứt thường xuyên hơn nhiều so với cảm giác lúc ngồi thử máy.
 * Thứ bảo đảm tới nơi vẫn là: ghi vào cơ sở dữ liệu, rồi bắn thông báo đẩy.
 * Socket chỉ làm cho những người đang mở app thấy nhanh hơn vài giây.
 *
 * Hệ quả phải nhớ: nối lại thì **hỏi lại bằng REST**, đừng phát lại qua ống.
 * Ống không nhớ nó đã bỏ lỡ những gì.
 *
 * Chặng này ống đã dựng nhưng chưa có gì chạy qua — mới có bắt tay và dò sống.
 */
@WebSocketGateway({
  namespace: SOCKET.namespace,
  // Không có `cors` mở toang: app gửi thẳng, không qua trình duyệt.
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly log = new Logger('Realtime');

  // `Namespace` chứ không phải `Server`: gateway này khai `namespace` nên thứ
  // Nest tiêm vào là không gian riêng, không phải cả máy chủ socket.
  @WebSocketServer()
  private readonly server!: Namespace;

  constructor(private readonly sessions: SessionService) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token = client.handshake.auth?.[SOCKET.authField] as string | undefined;
      if (!token) throw new Error('no token');

      const claims = this.sessions.verify(token, 'access');
      if (!(await this.sessions.isLive(claims.sid))) throw new Error('session revoked');

      client.data.userId = claims.sub;
      client.data.sessionId = claims.sid;
      await client.join(room(claims.sub));
      client.emit(SOCKET_OUT.ready, { userId: claims.sub });
    } catch {
      // Không nói lý do qua ống. Ai chưa có thẻ hợp lệ thì cũng không có quyền
      // biết vì sao mình bị từ chối.
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket): void {
    this.log.debug(`disconnected: ${String(client.data?.userId ?? '-')}`);
  }

  @SubscribeMessage(SOCKET_IN.ping)
  ping(@ConnectedSocket() _client: Socket, @MessageBody() _body: unknown) {
    return { ok: true };
  }

  /** Bắn tin cho một người, ở mọi máy họ đang mở. */
  toUser(userId: string, event: string, payload: unknown): void {
    this.server.to(room(userId)).emit(event, payload);
  }

  /** Đá một phiên ra khỏi ống sau khi nó bị thu hồi. */
  revokeSession(userId: string, sessionId: string): void {
    for (const socket of this.server.sockets.values()) {
      if (socket.data?.sessionId === sessionId) {
        socket.emit(SOCKET_OUT.sessionRevoked);
        socket.disconnect(true);
      }
    }
    this.log.debug(`session kicked off the socket: user ${userId}`);
  }
}
