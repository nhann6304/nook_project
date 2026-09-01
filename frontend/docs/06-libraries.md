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
| `expo` | 57.0.18 | Bộ khung. Lo build, quyền, cập nhật, quản lý bản gốc. | Buộc theo nhịp SDK của Expo. |
| `react-native` | 0.86.3 | Bản do Expo 57 chọn. **Đừng tự nâng.** | |
| `react` | 19.2.8 | Xem *Ghi chú React* ở cuối trang — con số này **cố ý lệch** khỏi bản Expo khai. | |
| `typescript` | 6.0.3 | Kiểu chặt (`strict` + `noUncheckedIndexedAccess`). | |
| `expo-router` | 57.0.17 | Điều hướng theo tệp. Đường dẫn có kiểu (`typedRoutes`), gõ sai route là tsc báo. | Kéo theo `react-dom` và một cụm `@radix-ui` cho bản web mà mình không dùng. |
| `expo-constants` · `expo-linking` | 57 | expo-router cần. | |

## 2 · Hiệu năng — nhóm quan trọng nhất

| Gói | Bản | Vì sao | Cái giá |
|---|---|---|---|
| `react-native-reanimated` | 4.5.1 | **Mọi animation.** Chạy trên luồng UI, nên JS có kẹt thì hoạt ảnh vẫn đều. Xem `src/components/primitives/Tap.tsx`. | Học khái niệm worklet. |
| `react-native-worklets` | 0.10.1 | Reanimated 4 tách phần worklet ra gói riêng. Không dùng trực tiếp. | |
| `react-native-gesture-handler` | 2.32.0 | Cử chỉ chạy trên luồng gốc. Nook điều hướng bằng cử chỉ nên đây là bắt buộc. | Phải bọc `GestureHandlerRootView` ngoài cùng, quên là mọi cử chỉ câm trên Android. |
| `@shopify/flash-list` | 2.0.2 | **Mọi danh sách.** Tái dùng ô đã cuộn qua. Bản 2 viết lại cho Kiến trúc mới. | Chỉ chạy trên Kiến trúc mới (dự án này đang dùng). |
| `expo-image` | 57.0.3 | **Mọi ảnh.** Cache đĩa, giải mã ngoài luồng chính. | |
| `react-native-screens` | 4.26.2 | Mỗi màn là một màn gốc thật, không phải View chồng lên nhau. | |

## 3 · Giao diện

| Gói | Bản | Vì sao | Cái giá |
|---|---|---|---|
| `react-native-safe-area-context` | 5.7.0 | Hỏi máy chỗ tai thỏ và thanh điều hướng. Là cách duy nhất để một bản thiết kế vừa cả iPhone SE lẫn Galaxy Fold. | |
| `react-native-svg` | 15.15.4 | Dấu hiệu "Ôm", khung đứt nét, vòng độ thân. **Bắt buộc**: Android vẽ `borderStyle:'dashed'` + `borderRadius` thành nét **liền**. | |
| `expo-linear-gradient` | 57.0.1 | Dải cam→hồng của nút chính và nút chụp. | |
| `expo-haptics` | 57.0.2 | Rung. Gói qua `src/lib/haptics.ts` — không gọi thẳng. | |
| `@expo/vector-icons` | 15.1.1 | Icon. Dùng bộ **Ionicons**, không trộn nhiều bộ. | Kèm ~10 tệp font icon vào gói cài. |
| `expo-font` | 57.0.2 | Nạp bộ chữ. | |
| `@expo-google-fonts/be-vietnam-pro` | 0.4.1 | Chữ thân. Bộ vẽ dấu tiếng Việt tử tế nhất trong tầm miễn phí. | |
| `@expo-google-fonts/fredoka` | 0.4.1 | **Chỉ** cho chữ "nook" ở màn Chào mừng. | Một bộ chữ nữa trong gói cài, dùng cho đúng bốn chữ cái. Chấp nhận vì nó là mặt của app. |
| `expo-splash-screen` · `expo-status-bar` · `expo-system-ui` | 57 | Màn mở, thanh trạng thái, nền hệ thống. | |

## 4 · Chức năng

| Gói | Bản | Vì sao | Cái giá |
|---|---|---|---|
| `expo-camera` | 57.0.4 | Màn chính của app. | |
| `expo-secure-store` | 57.0.2 | Cất thẻ đăng nhập vào Keychain (iOS) / Keystore (Android). **Chưa dùng** — chờ backend. | |
| `zustand` | 5.0.15 | Kho trạng thái. Đọc bằng selector nên đổi một trường không làm cả app vẽ lại — Context thì có. | Thêm một khái niệm cho người mới. |

## 5 · Công cụ

| Gói | Bản | Vì sao |
|---|---|---|
| `eslint` + `eslint-config-expo` | 9.39 / 57.0.2 | Nền cho luật riêng ở `eslint.config.js`. |
| `prettier` | 3.9.6 | Định dạng. Không cãi nhau về dấu cách. |
| `@types/react` | 19.2.18 | |

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

### Đã cân nhắc, để dành

| Gói | Vì sao chưa dùng |
|---|---|
| `react-native-mmkv` | Kho khoá-giá trị đồng bộ, nhanh hơn AsyncStorage nhiều. **Không chạy trên Expo Go.** Chờ lúc chuyển sang development build (cùng lúc với widget). |
| `react-native-unistyles` | Hệ style viết bằng C++, rất nhanh, có sẵn chủ đề. Nhưng nó giải bài toán mà `src/design` đã giải xong, mà lại thêm một gói gốc. |
| `@tanstack/react-query` | Rất hợp lúc có backend thật. Chưa có gì để lấy về nên chưa cài. |
| `react-native-bottom-sheet` | Chờ tới màn Trò chuyện. |

---

## 7 · Ghi chú React — đọc trước khi "sửa"

`package.json` ghi `"react": "19.2.8"` trong khi Expo SDK 57 khai **19.2.3**.
Cố ý, và có `expo.install.exclude: ["react"]` để `expo-doctor` không kêu.

Lý do: `expo-router` kéo theo `react-dom` (cho bản web mà mình không dùng), và
`react-dom@19.2.8` đòi `react@^19.2.8`. Hạ react về 19.2.3 là `npm install`
**hỏng hẳn** với lỗi `ERESOLVE`. Bản 19.2.8 thoả cả hai phía (`react-native`
đòi `^19.2.3`).

**Đừng "sửa" con số này về 19.2.3.** Nếu sau này Expo nâng bản khai lên bằng
hoặc cao hơn, gỡ khối `expo.install.exclude` đi là xong.

## 8 · Kiểm tra hệ thống còn nguyên

```bash
npm run check      # tsc --noEmit && eslint --max-warnings=0
npx expo-doctor    # 18/18 lúc viết dòng này
```

Muốn tự thấy lưới chặn hoạt động: tạo một file trong `src/features/` có
`style={{ backgroundColor: '#FF0000' }}` và `import { Text } from 'react-native'`,
rồi chạy `npx eslint` lên nó. Phải ra bốn lỗi kèm chỉ dẫn thay bằng gì.

## 9 · Yêu cầu môi trường

Node phải là **20.19.4+ / 22.13+ / 24.3+**.
Máy đang dùng Node **v23.11.0** — bản lẻ, không phải LTS, và `react-native@0.86.3`
đã cảnh báo `EBADENGINE`. Hiện chưa gây lỗi gì, nhưng nên đổi sang Node 22 LTS
hoặc 24 trước khi lên bản phát hành.
