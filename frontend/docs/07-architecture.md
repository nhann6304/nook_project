# Nook — Cấu trúc frontend

Tài liệu này trả lời đúng một câu hỏi: **"thứ tôi sắp viết thì đặt ở đâu?"**

---

## 1 · Cây thư mục

Trước hết, chỗ đứng của `frontend/` trong cả dự án:

```
nook_project/
├── .docs/        tài liệu CHUNG — backend cũng đọc
├── frontend/     ← bạn đang ở đây
├── backend/      chưa bắt đầu
└── .claude/skills/nook-ui/
```

**Mã app không bao giờ nằm ở gốc.** Gốc chỉ có ba thư mục trên cộng
`README.md`, `CLAUDE.md`, `.gitignore`.

Bên trong `frontend/`:

```
frontend/
├── app/                    ĐIỀU HƯỚNG. Chỉ điều hướng.
│   ├── _layout.tsx         gốc: nạp chữ, bọc provider, khai Stack
│   ├── index.tsx           cửa vào: đã đăng nhập chưa → đi đâu
│   ├── (auth)/             chưa đăng nhập: welcome · sign-in · verify
│   ├── (app)/              đã đăng nhập: camera · feed · circle
│   └── +not-found.tsx
│
├── src/
│   ├── design/             ⚠ NƠI DUY NHẤT ĐƯỢC VIẾT MÃ MÀU
│   │   ├── tokens.ts       màu · khoảng cách · bo góc · chữ · nhịp · bóng
│   │   ├── styles.ts       style dùng chung (đã lặp ≥3 màn mới được vào)
│   │   └── index.ts        cửa '@design'
│   │
│   ├── components/         BỘ MẢNH. Màn hình lắp từ đây, không tự dựng.
│   │   ├── primitives/     Txt · Tap · Button · IconButton · Field · CodeInput …
│   │   ├── layout/         Screen · Row/Col/Spacer/Flex · Card/Pill/Divider · List · Scroll
│   │   ├── brand/          Rings · Wordmark · Halo · GhostFrame · Avatar
│   │   ├── feedback/       EmptyState · Loading
│   │   └── index.ts        cửa '@ui'
│   │
│   ├── features/           THEO TÍNH NĂNG, không theo loại file
│   │   ├── auth/           screens/ · lib/ (identity, authApi) · store/
│   │   ├── camera/         screens/ · components/ (Shutter)
│   │   ├── feed/           screens/
│   │   └── circle/         screens/
│   │
│   ├── hooks/              hook dùng chung: useReduceMotion · useCountdown
│   ├── lib/                TS thuần, KHÔNG React: haptics
│   ├── stores/             kho dùng chung nhiều tính năng — tạo khi cần
│   ├── types/              kiểu dùng chung — tạo khi cần
│   └── mocks/              dữ liệu giả. Xoá khi có server.
│
├── docs/                   tài liệu frontend
├── assets/images/          logo SVG + icon PNG
├── README.md               cách chạy và cách đi thử một vòng
├── CLAUDE.md               ngữ cảnh frontend cho AI
└── eslint.config.js        lưới chặn "tự tiện ghi ra"
```

## 2 · Ba đường không được cắt qua

Đây là phần quan trọng nhất của tài liệu này.

### 2.1 Màn hình không biết router tồn tại

```tsx
// src/features/auth/screens/WelcomeScreen.tsx
export function WelcomeScreen({ onCreate, onSignIn }: { … }) { … }

// app/(auth)/welcome.tsx  ← chỉ chỗ này biết có router
export default function Welcome() {
  const router = useRouter();
  return <WelcomeScreen onCreate={() => router.push('…')} … />;
}
```

Được gì: màn hình test được và xem trước được mà không cần dựng cả app. Đổi
cách điều hướng thì chỉ `app/` đổi.

### 2.2 Màn hình không biết server tồn tại

Mọi lệnh gọi mạng nằm trong `src/features/<tên>/lib/*Api.ts`.
Hiện `authApi.ts` là **hàng giả** — trả kết quả sau 700ms, mã đúng là `123456`.
Khi backend có thật, chỉ file đó đổi.

### 2.3 Component không biết dữ liệu từ đâu ra

`<Avatar name uri level />` nhận props. Nó không gọi store, không gọi mạng.
Nhờ vậy nó dùng được ở màn Góc, màn Feed, màn Trò chuyện mà không kéo theo gì.

## 3 · Đường đi của một thao tác

Người dùng bấm "Tiếp tục" ở màn Đăng nhập:

```
SignInScreen           gọi props.onSubmit(method, target)
   ↓
app/(auth)/sign-in     gọi authApi.sendCode()  ← chỗ DUY NHẤT biết có server
   ↓
authStore.beginCode()  ghi trạng thái
   ↓
router.push('/verify') chuyển màn
```

Bốn tầng, mỗi tầng biết đúng một việc. Không tầng nào nhảy cóc qua tầng khác.

## 4 · Đặt file mới ở đâu

| Bạn đang viết | Đặt ở |
|---|---|
| Một màn mới | `src/features/<tính-năng>/screens/` + một file mỏng trong `app/` |
| Mảnh dùng ở ≥2 tính năng | `src/components/` + xuất ở `index.ts` |
| Mảnh chỉ một tính năng dùng | `src/features/<tính-năng>/components/` |
| Hàm không cần React | `src/lib/` |
| Hook dùng chung | `src/hooks/` |
| Gọi mạng | `src/features/<tính-năng>/lib/<tên>Api.ts` |
| Trạng thái một tính năng | `src/features/<tính-năng>/store/` |
| Trạng thái nhiều tính năng dùng | `src/stores/` |
| Màu / khoảng cách / nhịp mới | `src/design/tokens.ts` **kèm lý do** |

## 5 · Đường dẫn tắt

Khai trong `tsconfig.json`:

| Viết | Trỏ tới |
|---|---|
| `@design` | `src/design` |
| `@ui` | `src/components` |
| `@/…` | `src/…` |

Luôn dùng `@ui` và `@design`, đừng đi thẳng vào đường dẫn con
(`@/components/primitives/Txt`). Một cửa thì đổi cấu trúc bên trong không phải
sửa 40 file.

## 6 · Lệnh

Chạy từ thư mục `frontend/`:

```bash
npm run dev        # mở Metro, quét QR bằng Expo Go   ← LỆNH CHÍNH
npm run dev:clear  # xoá cache Metro (sau khi đổi thư viện)
npm run dev:tunnel # khi mạng chặn kết nối nội bộ
npm run ios        # mở thẳng máy giả lập iOS
npm run android    # mở thẳng máy giả lập Android
npm run check      # tsc + eslint — chạy trước khi coi là xong
npm run doctor     # expo-doctor: soi lệch bản và lỗi cấu hình
```

## 7 · Còn chạy được trên Expo Go

**Có.** Mọi gói đang dùng đều nằm trong danh sách Expo SDK 57, nên quét QR là
xem được ngay trên máy thật, không cần build.

Điều này sẽ **mất** khi làm widget màn hình chính — widget cần mã gốc, tức là
development build. Xem `04-widget.md`. Đó là quyết định nên chốt sớm:
chốt muộn thì đang giữa chừng phải đổi cả cách chạy dự án.
