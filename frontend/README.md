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
| 6 | **Xin quyền camera** | Bấm **Cho phép camera** → hộp thoại của máy. Thử bấm **Không cho phép**: màn đổi thành *"Camera đang tắt"* và nút thành *Mở Cài đặt máy*. Bật lại quyền rồi quay về app → màn **tự cập nhật**, không phải mở lại app |
| 7 | **Màn camera** | Khung ngắm **vuông, tràn sát mép** (390pt trên iPhone 14). Dưới thanh trên là **hàng người trong góc** — sáu avatar có vòng độ thân + ô `+` để mời. Đáy màn là **thanh tab ba chỗ**: Khoảnh khắc · Camera · Trò chuyện |
| 8 | Bấm nút chụp | Lõi co lại, máy rung một nhịp nặng |
| 9 | **Vừa chụp xong** | Ảnh đè lên khung ngắm, thanh trên đổi thành `✕` + *"Gửi cho 6 người trong góc"*, nút chụp thành **nút gửi** ở giữa. Hàng người vẫn đó — giờ nó là **danh sách người nhận**, và ô `+` biến mất. Chân màn nhắc lại lời hứa riêng tư. Bấm `✕` → về chụp lại **tức thì** (camera không bị tháo) |
| 10 | Chạm pill **`✎ Thêm một dòng…`** trên ảnh | Vào ô gõ ngay, icon bút chì biến mất khi có chữ đầu tiên |
| 11 | Bấm **nút gửi** | Vào thẳng Khoảnh khắc, ảnh của bạn nằm **đầu danh sách** |
| 12 | **Khoảnh khắc** | Bốn thẻ mẫu: avatar có vòng độ thân · tên · "3 phút trước" · ảnh có **caption nằm bên trong** · ba icon cảm xúc + ô nhắn riêng |
| 12b | Bấm **một icon cảm xúc** | Gửi ngay, **ở lại feed**, hàng đổi thành *"Đã nhắn cho Yến"* |
| 12c | Bấm **ô "Nhắn riêng cho Yến…"** | Mở **Trò chuyện** với tấm ảnh đó **ghim sẵn** ở đầu màn |
| 12d | Tab **Trò chuyện** | Danh sách: avatar · tên · tin cuối · thời gian. **Không có số tin chưa đọc** |
| 13 | Bấm **một avatar** ở hàng trên màn camera | **Góc của bạn**: sáu avatar + bốn chỗ viền đứt nét |
| 14 | Bấm **bánh răng** ở trên phải | **Cài đặt** → đổi **bảng màu**: Đất nung · Rêu · Biển đêm · Hoàng hôn · Trung tính. Cả app đổi ngay. Rồi đổi sang **English** — cũng đổi ngay, không phải mở lại |

### Nhìn kỹ mấy chỗ này

- **Nút bấm lún xuống ngay lúc ngón tay chạm**, không đợi. Chạy trên luồng UI.
- **Ô nhập không nhích một pixel nào** khi hiện lỗi — chỗ cho dòng lỗi luôn được chừa sẵn.
- **Chữ trên nút cam là màu tối**, không phải trắng. Ra ngoài nắng vẫn đọc được.
- **Bàn phím không che nút** "Tiếp tục".
- Vặn cỡ chữ máy lên to nhất (Cài đặt → Màn hình) — **layout không vỡ**.

- **Đổi sang English rồi đi lại một vòng.** Không câu nào còn tiếng Việt sót lại.
- **Đổi bảng màu rồi đi lại một vòng.** Không màn nào còn sót màu của bảng cũ —
  nếu thấy sót thì đó là một style dựng ở tầng module, xem `docs/10-theme.md`.
- **Bật đèn ở góc trên-trái khung ngắm rồi chụp bằng camera trước.** Cả màn hình
  phải loé trắng một nhịp — máy nào cũng chỉ có đèn thật ở mặt sau.
- **Chuyển tab qua lại vài lần rồi chụp.** Camera phải mở ra ngay, không có nhịp
  chờ khởi động — nó nằm trong tab nên không bị tháo.
- **Trong Trò chuyện, gõ một tin dài.** Ô soạn cao dần tới bốn dòng rồi mới cuộn
  bên trong; nút gửi chỉ sáng khi đã có chữ.
- **Xoay cỡ máy.** Khung ngắm lấy cạnh bằng số nhỏ hơn giữa 96% bề ngang và
  chiều cao còn lại, nên máy ngắn thì nó tự co chứ không tràn: iPhone SE 307pt,
  iPhone 14 374pt, 14 Pro Max 413pt.
- Nhìn chữ **nook** ở màn chào mừng: hai chữ "o" chính là hai vòng của logo,
  một đậm một sáng, chồng lên nhau.

Muốn xem **màn trống** thay vì có dữ liệu:

| Màn | Sửa ở đâu |
|---|---|
| Góc trống | `app/(app)/circle.tsx` — đổi `FRIENDS` thành `NO_FRIENDS` |
| Khoảnh khắc trống | `src/features/feed/store/momentsStore.ts` — đổi `SEED_MOMENTS` thành `NO_MOMENTS` |

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
│   ├── design/             ⚠ NƠI DUY NHẤT ĐƯỢC VIẾT MÃ MÀU (5 bảng màu)
│   ├── i18n/               ⚠ NƠI DUY NHẤT ĐƯỢC VIẾT CÂU TIẾNG VIỆT
│   ├── components/         28 mảnh, xuất qua một cửa '@ui'
│   ├── features/           theo tính năng: auth · camera · feed · chat · circle · settings
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
