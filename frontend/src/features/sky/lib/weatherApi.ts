/**
 * Trời có đang mưa không — cho chế độ màu "Theo trời".
 *
 * Hỏi Open-Meteo (miễn phí, không cần khoá) chứ không hỏi server LOVO: đây là
 * dịch vụ ngoài, nên KHÔNG đi qua `@/lib/api`. Toạ độ làm tròn 1 chữ số thập
 * phân (~11 km) trước khi rời máy — đủ biết mưa, không đủ biết nhà ai.
 */
const URL_BASE = 'https://api.open-meteo.com/v1/forecast';
const TIMEOUT_MS = 8_000;
/** Mã thời tiết WMO: mưa phùn 51–57, mưa 61–67, mưa rào 80–82, dông 95–99. */
const RAIN_CODES = [
  [51, 67],
  [80, 82],
  [95, 99],
] as const;
/** mm trong giờ qua — dưới mức này là ẩm chứ chưa mưa. */
const MIN_RAIN_MM = 0.1;

const round = (v: number) => Math.round(v * 10) / 10;

/** `null` = không biết (mất mạng, dịch vụ hỏng) — người gọi giữ trạng thái cũ. */
export async function isRaining(lat: number, lon: number): Promise<boolean | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const q = `?latitude=${round(lat)}&longitude=${round(lon)}&current=precipitation,weather_code`;
    const res = await fetch(URL_BASE + q, { signal: ctrl.signal });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      current?: { precipitation?: number; weather_code?: number };
    };
    const code = json.current?.weather_code ?? 0;
    const mm = json.current?.precipitation ?? 0;
    return mm >= MIN_RAIN_MM || RAIN_CODES.some(([a, b]) => code >= a && code <= b);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
