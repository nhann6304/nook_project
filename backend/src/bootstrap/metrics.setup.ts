import { BlockList, isIPv4 } from 'node:net';
import { HttpStatus } from '@nestjs/common';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Histogram, Registry, collectDefaultMetrics } from 'prom-client';
import { METRICS_PATH } from '../config/logger/index.js';

/** Mạng trong: chỉ máy cùng cụm (Prometheus) được hỏi. */
const INTERNAL = new BlockList();
INTERNAL.addSubnet('127.0.0.0', 8);
INTERNAL.addSubnet('10.0.0.0', 8);
INTERNAL.addSubnet('172.16.0.0', 12);
INTERNAL.addSubnet('192.168.0.0', 16);
INTERNAL.addAddress('::1', 'ipv6');
INTERNAL.addSubnet('fc00::', 7, 'ipv6');

function isInternal(address: string | undefined): boolean {
  if (!address) return false;
  const ip = address.startsWith('::ffff:') ? address.slice(7) : address;
  return INTERNAL.check(ip, isIPv4(ip) ? 'ipv4' : 'ipv6');
}

/**
 * `/metrics` cho Prometheus: số liệu tiến trình Node + thời gian từng đường.
 *
 * Route thô của Fastify, không qua Nest: không cổng thẻ, không vỏ JSON. Chặn
 * hai lớp — nginx trả 404 cho đường này, và ở đây chỉ trả lời kết nối từ mạng
 * trong mà KHÔNG có `X-Forwarded-For` (có header đó = đi qua proxy = từ ngoài).
 *
 * Nhãn là MẪU đường (`/v1/chats/:id/messages`), không phải đường thật — đường
 * thật chứa id, mỗi id một chuỗi số liệu là Prometheus nổ bộ nhớ.
 */
export function setupMetrics(app: NestFastifyApplication): void {
  const registry = new Registry();
  collectDefaultMetrics({ register: registry });

  const duration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration by route pattern',
    labelNames: ['method', 'route', 'status'] as const,
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
    registers: [registry],
  });

  const fastify = app.getHttpAdapter().getInstance();

  fastify.addHook('onResponse', (request, reply, done) => {
    const route = request.routeOptions.url;
    if (route && route !== METRICS_PATH) {
      duration.observe(
        { method: request.method, route, status: String(reply.statusCode) },
        reply.elapsedTime / 1_000,
      );
    }
    done();
  });

  fastify.get(METRICS_PATH, async (request, reply) => {
    if (request.headers['x-forwarded-for'] || !isInternal(request.socket.remoteAddress)) {
      return reply.code(HttpStatus.NOT_FOUND).send();
    }
    return reply.type(registry.contentType).send(await registry.metrics());
  });
}
