import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { FastifyReply } from 'fastify';
import { Env, NodeEnv } from '../../../../config/env/index.js';

/** Tên bánh quy. Có tiền tố `__Host-` để trình duyệt tự khoá theo đúng một tên miền. */
const REFRESH_COOKIE = '__Host-nook_rt';

/**
 * Bánh quy — **cho WEBSITE sau này, không phải cho app.**
 *
 * Vì sao app không dùng: React Native không giữ bánh quy một cách đáng tin.
 * `fetch` trên iOS và trên Android xử lý khác nhau, và cái sai không hiện ra ở
 * máy mình — nó hiện ra ở máy người dùng, dưới dạng thỉnh thoảng bị đăng xuất
 * không rõ vì sao, và không dựng lại được để tìm.
 *
 * Nên: **app nhận thẻ trong thân câu trả lời** rồi tự cất vào
 * `expo-secure-store`. Website thì nhận thẻ dài hạn qua bánh quy `httpOnly` —
 * ở trình duyệt, để thẻ trong `localStorage` là để hở cho XSS.
 *
 * Cùng một `SessionService` phát thẻ cho cả hai. Chỉ khác cái vỏ mang đi.
 */
@Injectable()
export class CookieService {
  constructor(private readonly config: ConfigService<Env, true>) {}

  setRefresh(reply: FastifyReply, token: string): void {
    reply.setCookie(REFRESH_COOKIE, token, this.options());
  }

  clearRefresh(reply: FastifyReply): void {
    reply.clearCookie(REFRESH_COOKIE, this.options());
  }

  private options() {
    const isProd = this.config.get('NODE_ENV', { infer: true }) === NodeEnv.production;
    return {
      httpOnly: true,
      // `strict` chứ không phải `lax`: không có luồng nào cần bánh quy sống sót
      // qua một cú bấm từ trang khác sang.
      sameSite: 'strict' as const,
      secure: isProd,
      path: '/',
      maxAge: this.config.get('JWT_REFRESH_TTL', { infer: true }),
    };
  }
}
