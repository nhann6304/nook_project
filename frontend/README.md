# Nook — frontend

App React Native chạy trên Expo. iOS và Android, không làm bản web.

**Stack:** Expo SDK 54 · React Native 0.81.5 · React 19.1 · TypeScript 5.9 ·
Expo Router 6 · Reanimated 4 · FlashList 2 · Zustand.

> **Vì sao SDK 54 chứ không phải bản mới nhất:** Expo Go trên App Store kẹt ở
> bản 54.0.2 từ 23/09/2025 và chỉ chạy được project SDK 54. Từ bản 55 trở lên
> Expo không phát hành cho iPhone thật nữa. Đừng nâng SDK — lý do đầy đủ ở
> [`docs/06-libraries.md`](docs/06-libraries.md) mục 7.

---

## 1 · Cần có sẵn

| Thứ | Bản | Kiểm bằng |
|---|---|---|
| Node.js | **20.19+ / 22.13+ / 24.3+** | `node -v` |
| npm | 10+ | `npm -v` |
| Expo Go trên điện thoại | **54.x** | App Store / Play Store (bản mới nhất ở đó chính là 54) |

> ⚠ Máy bạn đang là **Node v23.11.0** — bản lẻ, không phải LTS. Hiện chưa gây
> lỗi (chỉ có cảnh báo `EBADENGINE` lúc cài) nhưng nên đổi sang **Node 22 LTS**
> trước khi lên bản phát hành:
> ```bash
> nvm install 22 && nvm use 22
> ```

Không cần Xcode hay Android Studio nếu chỉ xem trên điện thoại thật.

## 2 · Chạy

```bash
cd frontend
npm ci             # cài lại đúng cây thư viện trong lockfile
npm run dev
```

> Dùng `npm ci`, **đừng xoá `package-lock.json`**. Lock đang ghim `react-dom`
> đúng bản; xoá nó thì npm tự lấy bản mới nhất và cài hỏng với lỗi `ERESOLVE`.
> Lý do đầy đủ ở [`docs/06-libraries.md`](docs/06-libraries.md) mục 1.

Terminal hiện một mã QR. Từ đây có ba đường:

| Cách | Làm gì |
|---|---|
| **Điện thoại thật** (nên dùng) | iPhone: mở **Camera** quét QR. Android: mở **Expo Go** rồi quét trong đó |
| Máy giả lập iOS | Bấm phím `i`. Cần Xcode |
| Máy giả lập Android | Bấm phím `a`. Cần Android Studio |

Máy tính và điện thoại **phải chung một mạng Wi-Fi**.

### Phím bấm khi đang chạy

| Phím | Tác dụng |
|---|---|
| `r` | Nạp lại app |
| `j` | Mở trình gỡ lỗi |
| `m` | Mở menu lập trình viên trên máy (hoặc lắc điện thoại) |
| `?` | Xem hết phím |
| `Ctrl+C` | Dừng |

### Quét không được?

| Hiện tượng | Cách xử lý |
|---|---|
| Điện thoại quay mãi rồi lỗi | Máy tính và điện thoại khác mạng Wi-Fi. Kiểm lại. |
| Công ty chặn mạng nội bộ | `npm run dev:tunnel` — chậm hơn nhưng đi vòng qua được |
| Expo Go báo **incompatible version** | Máy chủ đọc số SDK từ `node_modules/expo`, không phải `package.json`. Chạy `npm ci` rồi `npm run dev:clear`, và trên điện thoại phải **quét QR mới** chứ đừng bấm dòng cũ trong *Recently opened* |
| Lỗi lạ sau khi đổi thư viện | `rm -rf node_modules .expo && npm ci` — giữ nguyên `package-lock.json` |

## 3 · Đi thử một vòng

Sau khi app mở lên:

| Bước | Thấy gì | Thử gì |
|---|---|---|
| 1 | **Màn chào mừng** — chồng ba khung ảnh xoè ra, chữ "nook" ở trên | Xoè ra một lần rồi đứng yên. Bật "Giảm chuyển động" trong Cài đặt máy → hiệu ứng tắt |
| 2 | Bấm **Tạo tài khoản** | Chuyển màn trượt ngang |
| 3 | **Màn đăng nhập** | Đổi qua lại **Email ⇄ Số điện thoại**: con trượt chạy mượt, và **bàn phím đổi theo** (chữ ↔ số). Gõ email sai → viền đỏ + câu nhắc, nút mờ đi |
| 4 | Gõ email đúng, bấm **Tiếp tục** | Nút hiện vòng chờ 700ms |
| 5 | **Màn nhập mã** — sáu ô | Gõ `123456` → **tự vào app**, không cần bấm nút nào. Gõ mã khác → rung một nhịp, ô tự xoá trắng |
| 6 | **Màn camera** | Cho phép camera. Khung ngắm **vuông**, rộng 88% bề ngang máy. Bấm nút chụp: lõi co lại, máy rung một nhịp nặng |
| 7 | Bấm **"Góc của bạn · 0"** ở trên | **Lưới mười chỗ**: một chỗ là bạn, chín chỗ viền đứt nét |
| 8 | Bấm **"Khoảnh khắc"** ở đáy | Ba khung ảnh đứt nét, cùng dáng với màn chào mừng. Màn này trồi từ **dưới** lên |

### Nhìn kỹ mấy chỗ này

- **Nút bấm lún xuống ngay lúc ngón tay chạm**, không đợi. Chạy trên luồng UI.
- **Ô nhập không nhích một pixel nào** khi hiện lỗi — chỗ cho dòng lỗi luôn được chừa sẵn.
- **Chữ trên nút cam là màu tối**, không phải trắng. Ra ngoài nắng vẫn đọc được.
- **Bàn phím không che nút** "Tiếp tục".
- Vặn cỡ chữ máy lên to nhất (Cài đặt → Màn hình) — **layout không vỡ**.

Muốn xem góc **có người** thay vì trống: mở `src/mocks/friends.ts`, đổi
`FRIENDS` thành `SAMPLE_FRIENDS`.

## 4 · Lệnh

```bash
npm run dev        # mở Metro rồi quét QR   ← LỆNH CHÍNH
npm run dev:clear  # như trên nhưng xoá cache Metro
npm run dev:tunnel # khi mạng chặn kết nối nội bộ
npm run ios        # mở thẳng máy giả lập iOS
npm run android    # mở thẳng máy giả lập Android

npm run check      # tsc + eslint — CHẠY TRƯỚC KHI COI LÀ XONG
npm run typecheck  # chỉ kiểm kiểu
npm run lint       # chỉ kiểm luật
npm run lint:fix   # tự sửa những lỗi sửa được
npm run format     # sắp lại code cho đều
npm run doctor     # expo-doctor: soi lệch bản và lỗi cấu hình
```

## 5 · Cây thư mục

```
frontend/
├── app/                    ĐIỀU HƯỚNG. Chỉ điều hướng, không logic.
├── src/
│   ├── design/             ⚠ NƠI DUY NHẤT ĐƯỢC VIẾT MÃ MÀU
│   ├── components/         27 mảnh, xuất qua một cửa '@ui'
│   ├── features/           theo tính năng: auth · camera · feed · circle
│   ├── hooks/  lib/        dùng chung
│   └── mocks/              dữ liệu giả, xoá khi có server
├── docs/                   tài liệu frontend
├── assets/images/          logo SVG + icon PNG
└── eslint.config.js        lưới chặn "tự tiện ghi ra"
```

Chi tiết ở [`docs/07-architecture.md`](docs/07-architecture.md).

## 6 · Trước khi sửa code

Đọc **[`../.claude/skills/nook-ui/SKILL.md`](../.claude/skills/nook-ui/SKILL.md)**.
Ba câu:

1. **Không tự chế** — mọi thứ nhìn thấy được đã có trong `@ui`.
2. **Không viết số** — màu / khoảng cách / nhịp nằm trong `@design`.
3. **Mượt là yêu cầu, không phải điểm cộng** — xem [`docs/08-performance.md`](docs/08-performance.md).

ESLint chặn cứng cả ba. Tự thấy nó hoạt động:

```bash
cat > src/features/thu.tsx <<'EOF'
import { Text } from 'react-native';
export const X = () => <Text style={{ color: '#FF0000' }}>a</Text>;
EOF
npx eslint src/features/thu.tsx    # phải ra 3 lỗi kèm chỉ dẫn
rm src/features/thu.tsx
```
