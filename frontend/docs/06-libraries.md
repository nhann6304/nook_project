# Nook — Sổ thư viện

Mọi gói cài vào dự án đều phải có một dòng ở đây, kèm **lý do** và **cái giá**.
Không có dòng thì gỡ ra.

Vì sao cần sổ này: sáu tháng nữa không ai nhớ `react-native-worklets` vào dự án
làm gì, và không ai dám gỡ nó vì sợ hỏng. Rồi `node_modules` thành 700MB toàn
thứ không ai hiểu.

**Luật thêm gói mới**

1. Có làm được bằng thứ đã có không? Nếu có — không thêm.
2. Nó có nằm trong danh sách Expo SDK 57 không? Nếu không, kiểm tra nó có chạy
   trên **Expo Go** không. Không chạy thì phải chuyển sang development build,
   và đó là một quyết định lớn — hỏi trước.
3. Thêm xong: viết một dòng vào bảng dưới, ghi cả **cái giá** phải trả.
4. Chạy `npm run check` và `npx expo-doctor`.

---

## 1 · Nền

| Gói | Bản | Vì sao | Cái giá |
|---|---|---|---|
| `expo` | 54.0.37 | Bộ khung. Lo build, quyền, cập nhật, quản lý bản gốc. **Cố ý không phải bản mới nhất** — xem mục 7. | Buộc theo nhịp SDK của Expo. |
| `react-native` | 0.81.5 | Bản do Expo 54 chọn. **Đừng tự nâng.** | |
| `react` | 19.1.0 | Bản Expo 54 khai. | |
| `react-dom` | 19.1.0 | **Không dùng để làm web** — nhưng `expo-router` kéo nó vào, và không khai ở đây thì npm tự lấy bản mới nhất rồi cài hỏng. Xem cảnh báo ngay dưới bảng. | |
| `typescript` | 5.9.3 | Kiểu chặt (`strict` + `noUncheckedIndexedAccess`). | |
| `expo-router` | 6.0.24 | Điều hướng theo tệp. Đường dẫn có kiểu (`typedRoutes`), gõ sai route là tsc báo. | Kéo theo `react-dom` và một cụm `@radix-ui` cho bản web mà mình không dùng. |
| `expo-constants` · `expo-linking` | 18 / 8 | expo-router cần. | |

> ### ⚠ Đừng xoá `package-lock.json`
>
> `expo-router` kéo `react-dom` vào như một phụ thuộc kèm theo, dù dự án khai
> `platforms: ['ios','android']` và không hề làm web. Nếu `react-dom` không được
> ghim trong `package.json`, npm sẽ tự lấy **bản mới nhất** — mà bản đó đòi
> `react` cao hơn 19.1.0 của SDK 54. Kết quả:
>
> ```
> npm error ERESOLVE could not resolve
> npm error While resolving: react-dom@19.2.8
> npm error Found: react@19.1.0
> ```
>
> Đã ghim `react-dom: 19.1.0` để chặn. Hai điều cần nhớ:
>
> 1. **Cài lại thì dùng `npm ci`**, đừng xoá `package-lock.json`. Lock đang giữ
>    đúng cây thư viện; xoá nó là để npm tự chọn lại từ đầu.
> 2. Có máy npm chỉ **cảnh báo** rồi cho qua (`ERESOLVE overriding peer
>    dependency`), có máy **chặn thẳng**. Máy cho qua thì còn tệ hơn: nó cài
>    `react-dom` lệch bản với `react` mà không ai biết. Đã kiểm bằng
>    `npm install --strict-peer-deps` — sạch.

## 2 · Hiệu năng — nhóm quan trọng nhất

| Gói | Bản | Vì sao | Cái giá |
|---|---|---|---|
| `react-native-reanimated` | 4.1.7 | **Mọi animation.** Chạy trên luồng UI, nên JS có kẹt thì hoạt ảnh vẫn đều. Xem `src/components/primitives/Tap.tsx`. | Học khái niệm worklet. |
| `react-native-worklets` | 0.5.1 | Reanimated 4 tách phần worklet ra gói riêng. Không dùng trực tiếp. | |
| `react-native-gesture-handler` | 2.28.0 | Cử chỉ chạy trên luồng gốc. Nook điều hướng bằng cử chỉ nên đây là bắt buộc. | Phải bọc `GestureHandlerRootView` ngoài cùng, quên là mọi cử chỉ câm trên Android. |
| `@shopify/flash-list` | 2.0.2 | **Mọi danh sách.** Tái dùng ô đã cuộn qua. Bản 2 viết lại cho Kiến trúc mới. | Chỉ chạy trên Kiến trúc mới (dự án này đang dùng). |
| `expo-image` | 3.0.11 | **Mọi ảnh.** Cache đĩa, giải mã ngoài luồng chính. | |
| `react-native-screens` | 4.16.0 | Mỗi màn là một màn gốc thật, không phải View chồng lên nhau. | |

## 3 · Giao diện

| Gói | Bản | Vì sao | Cái giá |
|---|---|---|---|
| `react-native-safe-area-context` | 5.6.2 | Hỏi máy chỗ tai thỏ và thanh điều hướng. Là cách duy nhất để một bản thiết kế vừa cả iPhone SE lẫn Galaxy Fold. | |
| `react-native-svg` | 15.12.1 | Dấu hiệu "Ôm", khung đứt nét, vòng độ thân. **Bắt buộc**: Android vẽ `borderStyle:'dashed'` + `borderRadius` thành nét **liền**. | |
| `expo-linear-gradient` | 15.0.8 | Dải cam→hồng của nút chính và nút chụp. | |
| `expo-haptics` | 15.0.8 | Rung. Gói qua `src/lib/haptics.ts` — không gọi thẳng. | |
| `@expo/vector-icons` | 15.1.1 | Icon. Dùng bộ **Ionicons**, không trộn nhiều bộ. | Kèm ~10 tệp font icon vào gói cài. |
| `expo-font` | 14.0.12 | Nạp bộ chữ. | |
| `@expo-google-fonts/be-vietnam-pro` | 0.4.1 | Chữ thân. Bộ vẽ dấu tiếng Việt tử tế nhất trong tầm miễn phí. | |
| `@expo-google-fonts/fredoka` | 0.4.1 | **Chỉ** cho chữ "nook" ở màn Chào mừng. | Một bộ chữ nữa trong gói cài, dùng cho đúng bốn chữ cái. Chấp nhận vì nó là mặt của app. |
| `expo-splash-screen` · `expo-status-bar` · `expo-system-ui` | 31 / 3 / 6 | Màn mở, thanh trạng thái, nền hệ thống. | |

## 4 · Chức năng

| Gói | Bản | Vì sao | Cái giá |
|---|---|---|---|
| `expo-camera` | 17.0.10 | Màn chính của app. | |
| `expo-secure-store` | 15.0.8 | Cất thẻ đăng nhập vào Keychain (iOS) / Keystore (Android). **Chưa dùng** — chờ backend. | |
| `expo-localization` | 17.0.9 | Đọc ngôn ngữ máy để chọn tiếng Việt hay tiếng Anh lúc mở app lần đầu. | |
| `@react-native-async-storage/async-storage` | 2.2.0 | Nhớ ngôn ngữ người dùng đã chọn. Một cửa duy nhất ở `src/lib/storage.ts`. **Không để bí mật vào đây** — đó là việc của `expo-secure-store`. | Đọc **bất đồng bộ**, nên lúc khởi động có một nhịp chờ. MMKV đọc đồng bộ và nhanh hơn nhiều nhưng cần development build. |
| `zustand` | 5.0.15 | Kho trạng thái. Đọc bằng selector nên đổi một trường không làm cả app vẽ lại — Context thì có. | Thêm một khái niệm cho người mới. |

## 5 · Công cụ

| Gói | Bản | Vì sao |
|---|---|---|
| `eslint` + `eslint-config-expo` | 9.39 / 10.0.0 | Nền cho luật riêng ở `eslint.config.js`. |
| `prettier` | 3.9.6 | Định dạng. Không cãi nhau về dấu cách. |
| `@types/react` | 19.1.17 | |

---

## 6 · Đã cân nhắc rồi bỏ

Ghi lại để không ai đi lại đường cũ.

### NativeWind (Tailwind cho React Native) — **KHÔNG DÙNG**

Đã tra kỹ vì có yêu cầu "nếu có thể thì Tailwind". Ba lý do, xếp theo sức nặng:

**1. Nó đi ngược đúng yêu cầu chính của dự án.**
Yêu cầu là *"toàn bộ đều phải component, không được kiểu tự tiện ghi ra"*.
Tailwind làm việc **tự tiện ghi ra trở thành việc dễ nhất**: gõ
`className="mt-3 px-2 bg-orange-500"` ngay giữa màn hình nhanh hơn hẳn việc đi
tìm component có sẵn. Sáu tháng nữa là ba mươi sắc cam khác nhau nằm rải rác.

Cách đang dùng thì ngược lại: `src/design` là chỗ **duy nhất** được viết mã màu,
và ESLint chặn cứng ở mọi chỗ khác — [đã thử và bắt được thật](#), xem mục 8.

**2. Bản ổn định đang mắc kẹt giữa hai đời.**
`nativewind@latest` là **4.2.6**; bản 5 tới nay (01/09/2026) vẫn chỉ có nhánh
`preview` (`5.0.0-preview.4`) và đổi cả nền: cần `tailwindcss` v4 và thêm gói
`react-native-css`. Bản 4 thì có ma sát đã ghi nhận với Expo SDK 54 trở lên và
Reanimated 4 — mà Reanimated 4 chính là thứ giữ cho app này mượt.
Đứng lên một bản `preview`, hoặc lên một bản có ma sát đã biết, để đổi lấy một
tiện ích mà mục 1 vừa nói là **không muốn** — đó là món hời ngược.

**3. Chỗ tốn thời gian thật không nằm ở việc gõ style.**
Hệ token đã dựng xong và chặt hơn thang mặc định của Tailwind: tỉ lệ tương phản
đo theo nền `#0E0D0C` cho từng màu, dải mười màu cho vòng độ thân, tỉ lệ khung
ngắm camera. Tailwind không có mấy thứ đó và cũng không thay được.

> Về hiệu năng: NativeWind 4 dịch sẵn lớp **tĩnh** lúc build nên gần như không
> tốn thêm gì; chỉ lớp **động/điều kiện** mới phải giải lúc chạy. Nên hiệu năng
> **không** phải lý do chính để bỏ — ba lý do trên mới là.

### i18next + react-i18next — **KHÔNG DÙNG**

Là lựa chọn mặc định của phần lớn dự án React Native (6 triệu lượt tải mỗi
tuần), nên bỏ nó thì phải nói rõ vì sao.

**Đã đo trước khi quyết.** Chạy chính Hermes của dự án này lên
(`node_modules/react-native/sdks/hermesc/osx-bin/hermes`):

| Thứ | Kết quả |
|---|---|
| `Intl.NumberFormat('vi-VN').format(1234567.5)` | `1.234.567,5` ✔ |
| `Intl.DateTimeFormat('vi-VN', …)` | `1 tháng 9` ✔ |
| `Intl.PluralRules` | **ném lỗi** — `Cannot read property 'prototype' of undefined` |
| `Intl.RelativeTimeFormat` · `Intl.ListFormat` | **ném lỗi** như trên |

Cơ chế số nhiều của i18next chạy trên `Intl.PluralRules`. Thiếu nó thì i18next
rơi về bộ luật tương thích riêng của nó — tức là thêm một tầng nữa để hiểu và
để hỏng, đúng ở chỗ mình định nhờ thư viện lo hộ.

Cộng thêm ba điều:

- **Cân nặng.** i18next + react-i18next ≈ 55KB min, cho **hai** ngôn ngữ và
  khoảng 130 câu. Bộ chữ của Nook cộng cả ruột i18n chưa tới 12KB.
- **An toàn kiểu.** Muốn i18next kiểm được khoá thì phải khai thêm
  `declare module 'i18next'`, và nó vẫn không kiểm được *tham số của từng câu*.
  Bản tự viết kiểm cả ba: sai khoá, thiếu bản dịch, quên tham số — xem
  `src/i18n/types.ts`.
- **Số dạng số nhiều.** Tiếng Việt có **một** dạng, tiếng Anh có **hai**. Đó là
  bốn dòng code, không phải một thư viện.

**Đường lùi vẫn để mở.** Bộ chữ ở `src/i18n/locales/` là JSON lồng nhau đúng
khuôn i18next. Ngày nào Nook thêm tiếng Nga (4 dạng số nhiều) hay tiếng Ả Rập
(6 dạng), hoặc cần nối công cụ dịch như Crowdin, thì đổi sang là việc cơ học.

### Đã cân nhắc, để dành

| Gói | Vì sao chưa dùng |
|---|---|
| `react-native-mmkv` | Kho khoá-giá trị đồng bộ, nhanh hơn AsyncStorage nhiều. **Không chạy trên Expo Go.** Chờ lúc chuyển sang development build (cùng lúc với widget). |
| `react-native-unistyles` | Hệ style viết bằng C++, rất nhanh, có sẵn chủ đề. Nhưng nó giải bài toán mà `src/design` đã giải xong, mà lại thêm một gói gốc. |
| `@tanstack/react-query` | Rất hợp lúc có backend thật. Chưa có gì để lấy về nên chưa cài. |
| `react-native-bottom-sheet` | Chờ tới màn Trò chuyện. |

---

## 7 · Vì sao ghim SDK 54, không phải bản mới nhất

**Đừng nâng SDK trước khi đọc hết mục này.** Nâng lên là app không mở được trên
iPhone nữa, và lỗi báo ra (`Project is incompatible with this version of Expo Go`)
không hề nói ra nguyên nhân thật.

### Lý do

Expo Go — app dùng để quét QR xem thử trên máy thật — **trên App Store đang kẹt ở
bản 54.0.2, phát hành 23/09/2025 và không cập nhật từ đó.** Nó chỉ chạy được
project SDK 54.

Expo vẫn phát hành Expo Go mới, nhưng chỉ trên GitHub và chỉ hai dạng:

| Bản | Ngày | Có gói gì |
|---|---|---|
| 57.0.9 | 15/08/2026 | `.apk` (Android máy thật) + `.tar.gz` (**máy giả lập** iOS) |
| 57.0.0 | 24/06/2026 | `.apk` + `.tar.gz` |
| **54.0.2** | **23/09/2025** | **App Store — đường duy nhất tới iPhone thật** |

Nhìn cột phải là ra: từ bản 55 trở lên **không có bản nào cho iPhone thật**.
Đưa Expo Go mới lên App Store thì Apple phải duyệt, mà Expo Go là app khổng lồ
(gói sẵn mọi thư viện gốc của mọi SDK nó đỡ) — Expo đã ngừng làm việc đó và
chuyển sang đẩy người dùng qua *development build*. Android né được vì `.apk`
cài thẳng, không ai duyệt.

Kết luận: **iPhone thật + Expo Go = trần cứng ở SDK 54.** Không lách được bằng
cách xoá app, đổi Apple ID hay đổi vùng App Store.

### Hạ xuống có mất gì không

Không mất quyết định kiến trúc nào. Đã đối chiếu từng gói:

| | SDK 54 (đang dùng) | SDK 57 |
|---|---|---|
| FlashList | **2.0.2** | 2.0.2 — *y hệt* |
| Reanimated | 4.1.7 | 4.5.1 |
| Kiến trúc mới | mặc định ✓ | ✓ |
| React Compiler | ✓ | ✓ |
| expo-image · camera · svg · gesture-handler | đủ cả | đủ cả |
| React Native | 0.81.5 | 0.86.3 |

Chỉ lùi một đời React Native. Hệ token, 27 component, luật ESLint, cách chia thư
mục giữ nguyên không sửa một dòng.

### Ba chỗ code phải sửa khi hạ — nếu nâng lại thì phải đảo ngược

1. **`StyleSheet.absoluteFill`.** RN 0.81 định nghĩa nó là **mã style** (một con
   số đã đăng ký), còn bản object tên là `absoluteFillObject`. RN 0.86 gộp lại,
   `absoluteFill` chính là object. Nên trong dự án này phải viết
   `...StyleSheet.absoluteFillObject` khi spread — spread `absoluteFill` ở RN
   0.81 ra một object **rỗng**, và nó **không báo lỗi lúc chạy**: lớp phủ chỉ
   đơn giản là biến mất.
2. **`StyleSheet.create` suy kiểu.** RN 0.81 cho mỗi mục kiểu hợp
   `ViewStyle | TextStyle | ImageStyle`, nên không truyền thẳng vào `style` của
   `<View>` được. `src/design/styles.ts` khai kiểu `Common` tường minh để chặn.
3. **`contentContainerStyle`.** Nó kế thừa từ `ScrollViewProps` nên bản thân có
   thể đã là một mảng — phải truyền mảng `[s.content, contentContainerStyle]`,
   không được spread.

### Khi nào thì nâng

Lúc chuyển sang **development build** — mà đằng nào cũng phải chuyển khi làm
widget (xem [`04-widget.md`](04-widget.md)). Development build không dùng Expo Go
nên trần SDK biến mất. Nâng thẳng lên bản mới nhất lúc đó, và đảo ngược ba chỗ ở
trên.

### Muốn xem SDK mới trên Android ngay

Không cần đụng gì tới dự án — chỉ cần một máy Android:

```
https://github.com/expo/expo-go-releases/releases  →  Expo-Go-57.0.9.apk
```

Cài `.apk` đó vào máy Android là quét được project SDK 57. Nhưng dự án hiện ở
SDK 54, nên Expo Go **54.x** trên Play Store mới là bản đúng để dùng lúc này.

## 8 · Kiểm tra hệ thống còn nguyên

```bash
npm run check      # tsc --noEmit && eslint --max-warnings=0
npx expo-doctor    # 17/17 lúc viết dòng này
```

Muốn tự thấy lưới chặn hoạt động: tạo một file trong `src/features/` có
`style={{ backgroundColor: '#FF0000' }}`, `import { Text } from 'react-native'`
và một câu tiếng Việt viết thẳng trong JSX, rồi chạy `npx eslint` lên nó.
Phải ra năm lỗi kèm chỉ dẫn thay bằng gì.

### Tự đo lại `Intl` của Hermes

Con số ở mục 6 lấy từ đây. Chạy lại khi nâng SDK — bộ `Intl` của Hermes có thêm
bớt theo bản:

```bash
cat > /tmp/intl.js <<'EOF'
const t = (n, f) => { try { print(n + ': ' + f()); } catch (e) { print(n + ': HỎNG'); } };
t('NumberFormat', () => new Intl.NumberFormat('vi-VN').format(1234567.5));
t('DateTimeFormat', () => new Intl.DateTimeFormat('vi-VN', {day:'numeric',month:'long'}).format(new Date(2026,8,1)));
t('PluralRules', () => new Intl.PluralRules('en').select(2));
t('RelativeTimeFormat', () => new Intl.RelativeTimeFormat('vi').format(-2, 'hour'));
EOF
node_modules/react-native/sdks/hermesc/osx-bin/hermes /tmp/intl.js
```

## 9 · Yêu cầu môi trường

Node phải là **20.19.4+ / 22.13+ / 24.3+**.
Máy đang dùng Node **v23.11.0** — bản lẻ, không phải LTS, và `react-native@0.86.3`
đã cảnh báo `EBADENGINE`. Hiện chưa gây lỗi gì, nhưng nên đổi sang Node 22 LTS
hoặc 24 trước khi lên bản phát hành.
