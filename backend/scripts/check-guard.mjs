#!/usr/bin/env node
/**
 * Chung minh cong the DANG DONG — bang cach go tung cua mot, khong cam the.
 *
 * Bo soi tinh (`check-public-routes.mjs`) doc MA NGUON. Bo nay goi THAT vao
 * server dang chay. Hai thu khac nhau: ma nguon co the dung ma cong van ho, vi
 * mot loi noi day o cho khac — dan `APP_GUARD` nham module, hay mot controller
 * quen khong nam trong cay module.
 *
 *   node scripts/check-guard.mjs
 */
import { io } from 'socket.io-client';

const BASE = process.env.BASE ?? 'http://localhost:4000';
const UUID = '00000000-0000-4000-8000-000000000000';

/** Duong duoc phep tra ve thu khac 401 khi KHONG cam the. */
const PUBLIC = new Set([
  'POST /v1/auth/code',
  'POST /v1/auth/verify',
  'POST /v1/auth/refresh',
  'POST /v1/auth/logout',
  'GET /health',
]);

const G = '\x1b[32m', R = '\x1b[31m', D = '\x1b[2m', B = '\x1b[1m', O = '\x1b[0m';
let pass = 0, fail = 0;
const ok = (m) => { pass += 1; console.log(`${G}  v${O} ${m}`); };
const no = (m, d) => { fail += 1; console.log(`${R}  x${O} ${m} ${D}(${d})${O}`); };

const spec = await (await fetch(`${BASE}/api/v1/docs-json`)).json();

for (const [rawPath, ops] of Object.entries(spec.paths)) {
  for (const method of Object.keys(ops)) {
    const label = `${method.toUpperCase()} ${rawPath}`;
    const url = BASE + rawPath.replace(/\{[^}]+\}/g, UUID);

    const res = await fetch(url, {
      method: method.toUpperCase(),
      headers: { 'content-type': 'application/json' },
      body: ['post', 'patch', 'put'].includes(method) ? '{}' : undefined,
      redirect: 'manual',
    });
    const body = await res.json().catch(() => ({}));

    if (PUBLIC.has(label)) {
      if (res.status === 401) no(`${label} le ra la cua MO`, 'lai tra 401');
      else ok(`${label} ${D}cua mo, dung nhu khai bao${O}`);
      continue;
    }
    if (res.status === 401 && body.code === 'auth.unauthorized') ok(`${label} ${D}dong${O}`);
    else no(`${label} PHAI dong`, `tra ${res.status} ${body.code ?? ''}`);
  }
}

// ── Ong socket cung la mot cai cua ─────────────────────────────────────────
const connect = (auth) =>
  new Promise((resolve) => {
    const s = io(`${BASE}/rt`, { auth, transports: ['websocket'], reconnection: false, timeout: 4000 });
    const done = (r) => { s.close(); resolve(r); };
    s.on('rt.ready', () => done('ready'));
    s.on('disconnect', () => done('disconnected'));
    s.on('connect_error', () => done('refused'));
    setTimeout(() => done('timeout'), 5000);
  });

const noToken = await connect({});
noToken === 'ready' ? no('socket khong the PHAI bi cat', 'lai vao duoc')
                    : ok(`socket khong the ${D}bi cat (${noToken})${O}`);
const badToken = await connect({ token: 'khong-phai-the' });
badToken === 'ready' ? no('socket the bia PHAI bi cat', 'lai vao duoc')
                     : ok(`socket the bia ${D}bi cat (${badToken})${O}`);

console.log();
if (fail === 0) { console.log(`${B}${G}DAT - ${pass}/${pass + fail}${O}`); process.exit(0); }
console.log(`${B}${R}HONG - ${pass}/${pass + fail}${O}`); process.exit(1);
