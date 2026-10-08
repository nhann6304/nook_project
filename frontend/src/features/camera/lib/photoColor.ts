/**
 * Rút MÀU CHỦ ĐẠO của một tấm ảnh — ngay trên máy, không cần server, chạy được
 * trong Expo Go.
 *
 * Thu ảnh về 16×16, xuất PNG base64, tự giải PNG (fflate cho phần nén) rồi lấy
 * màu: chia vòng màu thành 36 ngăn, mỗi điểm ảnh bỏ phiếu theo ĐỘ RỰC của nó
 * (xám, quá tối, quá sáng thì gần như không có phiếu). Ngăn nhiều phiếu nhất
 * thắng. Ảnh gần như đen trắng → `null`, giữ màu cũ.
 */
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { unzlibSync } from 'fflate';
import { toSeed, type Seed } from '@design';

const SIDE = 16;
const BINS = 36;
/** Dưới mức này coi như ảnh không có màu gì để lấy. */
const MIN_VOTES = 2.5;

export async function photoSeed(uri: string): Promise<Seed | null> {
  const img = await ImageManipulator.manipulate(uri)
    .resize({ width: SIDE, height: SIDE })
    .renderAsync();
  const out = await img.saveAsync({ format: SaveFormat.PNG, base64: true });
  if (!out.base64) return null;
  const px = decodePng(fromBase64(out.base64));
  return px ? pick(px) : null;
}

function pick({ data, channels }: Pixels): Seed | null {
  const votes = new Float64Array(BINS);
  const sats = new Float64Array(BINS);
  for (let i = 0; i + 2 < data.length; i += channels) {
    const [h, s, l] = toHsl(data[i]! / 255, data[i + 1]! / 255, data[i + 2]! / 255);
    if (l < 0.1 || l > 0.94) continue;
    const w = s * (1 - Math.abs(2 * l - 1));
    const b = Math.floor(h / (360 / BINS)) % BINS;
    votes[b] = votes[b]! + w;
    sats[b] = sats[b]! + w * s;
  }
  // Gộp hai ngăn kề nhau: một màu thật hay nằm vắt qua ranh giới hai ngăn.
  let best = 0;
  let bestVote = 0;
  for (let b = 0; b < BINS; b++) {
    const v = votes[b]! + 0.5 * (votes[(b + 1) % BINS]! + votes[(b + BINS - 1) % BINS]!);
    if (v > bestVote) {
      bestVote = v;
      best = b;
    }
  }
  const total = votes.reduce((a, v) => a + v, 0);
  if (total < MIN_VOTES) return null;
  const sat = votes[best]! > 0 ? sats[best]! / votes[best]! : 0.5;
  return toSeed((best + 0.5) * (360 / BINS), sat);
}

function toHsl(r: number, g: number, b: number): [number, number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  const h =
    max === r
      ? ((g - b) / d + (g < b ? 6 : 0)) * 60
      : max === g
        ? ((b - r) / d + 2) * 60
        : ((r - g) / d + 4) * 60;
  return [h, s, l];
}

/* ── Giải PNG tối thiểu: 8 bit, RGB hoặc RGBA, không xen kẽ (đúng thứ
 *    expo-image-manipulator xuất ra). Khác dạng đó thì trả `null`. ── */

type Pixels = { data: Uint8Array; channels: number };

function decodePng(buf: Uint8Array): Pixels | null {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  let pos = 8;
  let width = 0;
  let height = 0;
  let channels = 0;
  const idat: Uint8Array[] = [];
  while (pos + 8 <= buf.length) {
    const len = view.getUint32(pos);
    const type = String.fromCharCode(buf[pos + 4]!, buf[pos + 5]!, buf[pos + 6]!, buf[pos + 7]!);
    const body = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      width = view.getUint32(pos + 8);
      height = view.getUint32(pos + 12);
      const depth = body[8];
      const color = body[9];
      if (depth !== 8 || body[12] !== 0) return null;
      channels = color === 6 ? 4 : color === 2 ? 3 : 0;
      if (!channels) return null;
    } else if (type === 'IDAT') {
      idat.push(body);
    } else if (type === 'IEND') {
      break;
    }
    pos += 12 + len;
  }
  if (!width || !idat.length) return null;

  const joined = new Uint8Array(idat.reduce((n, c) => n + c.length, 0));
  let off = 0;
  for (const c of idat) {
    joined.set(c, off);
    off += c.length;
  }
  const raw = unzlibSync(joined);
  const stride = width * channels;
  const out = new Uint8Array(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const src = y * (stride + 1) + 1;
    const row = y * stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? out[row + x - channels]! : 0;
      const b = y > 0 ? out[row - stride + x]! : 0;
      const c = x >= channels && y > 0 ? out[row - stride + x - channels]! : 0;
      const v = raw[src + x]!;
      out[row + x] =
        (filter === 1
          ? v + a
          : filter === 2
            ? v + b
            : filter === 3
              ? v + ((a + b) >> 1)
              : filter === 4
                ? v + paeth(a, b, c)
                : v) & 0xff;
    }
  }
  return { data: out, channels };
}

function paeth(a: number, b: number, c: number) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function fromBase64(s: string): Uint8Array {
  const clean = s.replace(/[^A-Za-z0-9+/]/g, '');
  const out = new Uint8Array(Math.floor((clean.length * 3) / 4));
  let o = 0;
  for (let i = 0; i < clean.length; i += 4) {
    const n =
      (B64.indexOf(clean[i]!) << 18) |
      (B64.indexOf(clean[i + 1]!) << 12) |
      ((B64.indexOf(clean[i + 2] ?? 'A') & 63) << 6) |
      (B64.indexOf(clean[i + 3] ?? 'A') & 63);
    if (o < out.length) out[o++] = (n >> 16) & 0xff;
    if (o < out.length) out[o++] = (n >> 8) & 0xff;
    if (o < out.length) out[o++] = n & 0xff;
  }
  return out;
}
