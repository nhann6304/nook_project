import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  type GatewayMetadata,
} from '@nestjs/websockets';
import type { Namespace, Socket } from 'socket.io';
import { SOCKET, SOCKET_IN, SOCKET_OUT } from '@nook/shared';
import { SessionService } from '../../apis/auth/service/index.js';
import { RedisService } from '../../infra/redis/service/index.js';
import type { IPresenceChange } from '../interface/index.js';

/** Mỗi người một phòng riêng. Bắn tin cho một người là bắn vào phòng của họ. */
const room = (userId: string) => `user:${userId}`;

/**
 * Tuỳ chọn CHUNG cho mọi gateway trên `SOCKET.namespace` — cùng một máy chủ
 * socket, khai lệch là tuỳ gateway nào được dựng trước.
 *
 * Chỉ websocket, không long-polling: polling là nhiều request HTTP rời, chạy
 * nhiều bản server thì phải dính phiên ở bộ cân bằng tải. Websocket là MỘT kết
 * nối nên không cần — và cầu Redis lo phần bắn chéo giữa các bản.
 */
export const GATEWAY_OPTIONS: GatewayMetadata = {
  namespace: SOCKET.namespace,
  transports: ['websocket'],
  // Không có `cors` mở toang: app gửi thẳng, không qua trình duyệt.
};

/**
 * Ai đang mở app — đếm SOCKET qua mọi bản server, trong Redis.
 *
 * ZSET: thành viên = id socket, điểm = lần nghe nhịp tim cuối. Bản server chết
 * thì socket của nó không kịp tự xoá; điểm cũ quá `PRESENCE_STALE_MS` là không
 * tính nữa, nên "online ma" sống tối đa chừng đó chứ không mãi mãi.
 */
const presenceKey = (userId: string) => `rt:presence:${userId}`;
const PRESENCE_STALE_MS = 3 * 60_000;
/** Làm mới điểm theo nhịp tim của engine.io (25 giây/lần), nhưng thưa hơn. */
const PRESENCE_REFRESH_MS = 60_000;

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
 * Gateway này lo bắt tay, phòng và đếm người online. Tính năng (chat) có
 * gateway RIÊNG trên cùng không gian, và nghe vào/rời qua `onPresence` — tầng
 * dưới phát, tầng trên nghe, ống không biết chat tồn tại.
 */
@WebSocketGateway(GATEWAY_OPTIONS)
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly log = new Logger('Realtime');
  private readonly presenceListeners: ((change: IPresenceChange) => Promise<void> | void)[] = [];

  // `Namespace` chứ không phải `Server`: gateway này khai `namespace` nên thứ
  // Nest tiêm vào là không gian riêng, không phải cả máy chủ socket.
  @WebSocketServer()
  private readonly server!: Namespace;

  constructor(
    private readonly sessions: SessionService,
    private readonly redis: RedisService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token = client.handshake.auth?.[SOCKET.authField] as string | undefined;
      if (!token) throw new Error('no token in handshake.auth');

      const claims = this.sessions.verify(token, 'access');
      if (!(await this.sessions.isLive(claims.sid))) throw new Error('session revoked');

      client.data.userId = claims.sub;
      client.data.sessionId = claims.sid;
      await client.join(room(claims.sub));
      client.emit(SOCKET_OUT.ready, { userId: claims.sub });

      this.log.log(`connected: user ${claims.sub} (${this.server.sockets.size} online)`);
    } catch (error) {
      // Log ĐỦ để biết vì sao không nối được — nhưng chỉ ở phía server. Qua ống
      // thì cắt thẳng, không nói lý do: ai chưa có thẻ hợp lệ cũng không có
      // quyền biết mình sai ở đâu.
      this.log.warn(
        `refused: ${error instanceof Error ? error.message : String(error)}`,
      );
      client.disconnect(true);
      return;
    }

    // Giữ lời hứa lại: rời ngay sau khi vào thì phải đợi phần "vào" ghi xong,
    // không thì `zrem` chạy trước `zadd` và để lại một socket ma.
    client.data.presence = this.presenceIn(client);
    await client.data.presence;
  }

  async handleDisconnect(client: Socket): Promise<void> {
    const userId = client.data?.userId as string | undefined;
    this.log.log(
      `disconnected: ${userId ? `user ${userId}` : 'unauthenticated client'} (${this.server.sockets.size} online)`,
    );
    if (!userId) return;
    await (client.data.presence as Promise<void> | undefined);
    await this.presenceOut(client, userId);
  }

  @SubscribeMessage(SOCKET_IN.ping)
  ping(@ConnectedSocket() _client: Socket, @MessageBody() _body: unknown) {
    return { ok: true };
  }

  /** Bắn tin cho một người, ở mọi máy họ đang mở — qua cầu Redis là mọi bản server. */
  toUser(userId: string, event: string, payload: unknown): void {
    this.server.to(room(userId)).emit(event, payload);
  }

  /** Bắn cùng một tin cho nhiều người trong MỘT lần đẩy qua cầu. */
  toUsers(userIds: string[], event: string, payload: unknown): void {
    if (userIds.length === 0) return;
    this.server.to(userIds.map(room)).emit(event, payload);
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

  // ── Online / offline ───────────────────────────────────────────────────────

  /** Tầng trên đăng ký nghe vào/rời. Gọi lúc `onModuleInit`. */
  onPresence(listener: (change: IPresenceChange) => Promise<void> | void): void {
    this.presenceListeners.push(listener);
  }

  /** Trong số này, ai đang có ít nhất một socket còn nhịp tim. */
  async onlineAmong(userIds: string[]): Promise<Set<string>> {
    if (userIds.length === 0) return new Set();
    const since = Date.now() - PRESENCE_STALE_MS;
    const pipe = this.redis.client.pipeline();
    for (const id of userIds) pipe.zcount(presenceKey(id), since, '+inf');
    const out = (await pipe.exec()) ?? [];
    return new Set(userIds.filter((_, i) => Number(out[i]?.[1] ?? 0) > 0));
  }

  private async presenceIn(client: Socket): Promise<void> {
    const userId = client.data.userId as string;
    try {
      const count = await this.touchPresence(userId, client.id);
      await this.emitPresence({ userId, online: true, changed: count === 1, socket: client });

      // Nhịp tim của engine.io: giữ điểm còn tươi, thưa hơn nhịp thật.
      let last = Date.now();
      client.conn.on('heartbeat', () => {
        if (Date.now() - last < PRESENCE_REFRESH_MS) return;
        last = Date.now();
        void this.touchPresence(userId, client.id).catch(() => undefined);
      });
    } catch (error) {
      this.log.warn(`presence in failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async presenceOut(client: Socket, userId: string): Promise<void> {
    try {
      const key = presenceKey(userId);
      const out = await this.redis.client
        .multi()
        .zrem(key, client.id)
        .zremrangebyscore(key, '-inf', Date.now() - PRESENCE_STALE_MS)
        .zcard(key)
        .exec();
      const removed = Number(out?.[0]?.[1] ?? 0);
      const left = Number(out?.[2]?.[1] ?? 0);
      await this.emitPresence({ userId, online: false, changed: removed === 1 && left === 0, socket: client });
    } catch (error) {
      this.log.warn(`presence out failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /** Ghi nhịp tim của một socket, trả số socket còn sống của người đó. */
  private async touchPresence(userId: string, socketId: string): Promise<number> {
    const key = presenceKey(userId);
    const now = Date.now();
    const out = await this.redis.client
      .multi()
      .zadd(key, now, socketId)
      .zremrangebyscore(key, '-inf', now - PRESENCE_STALE_MS)
      .pexpire(key, PRESENCE_STALE_MS)
      .zcard(key)
      .exec();
    return Number(out?.[3]?.[1] ?? 0);
  }

  private async emitPresence(change: IPresenceChange): Promise<void> {
    for (const listener of this.presenceListeners) {
      try {
        await listener(change);
      } catch (error) {
        this.log.warn(`presence listener failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
}
