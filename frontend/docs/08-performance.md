# Nook — Hiệu năng

**Đây là yêu cầu số một của dự án**, không phải mục "làm nốt nếu còn thời gian".
App phải mượt, không phải "chạy được".

Tài liệu này ghi những gì đã làm và những luật phải giữ. Mỗi luật gắn với một
kiểu lag mà người dùng cảm nhận được — không có luật nào ở đây là lý thuyết.

---

## 1 · Đã bật sẵn

| Thứ | Trạng thái | Được gì |
|---|---|---|
| **Kiến trúc mới** (Fabric + TurboModules + JSI) | Luôn bật ở SDK 57 | Bỏ hẳn cây cầu JSON giữa JS và mã gốc. Đây là nền, mọi thứ khác xây lên trên. |
| **Hermes** | Mặc định | Mã máy dựng sẵn lúc build, mở app nhanh hơn. |
| **React Compiler** | `experiments.reactCompiler: true` | Tự ghi nhớ component và hàm. Cắt phần lớn số lần vẽ lại thừa mà không phải rải `useMemo`/`useCallback` khắp nơi. Xác nhận đang bật: dòng `React Compiler enabled` khi chạy `npx expo export`. |
| **Reanimated 4** | Mọi animation | Chạy trên luồng UI. |
| **FlashList 2** | Mọi danh sách | Tái dùng ô. |
| **expo-image** | Mọi ảnh | Cache đĩa, giải mã ngoài luồng chính. |

## 2 · Bảy luật

### 2.1 Animation không bao giờ chạy trên luồng JS

```tsx
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';  // ĐÚNG
import { Animated } from 'react-native';                                              // SAI
```

Luồng JS là luồng đang mở camera, đang giải mã ảnh, đang gọi mạng. Animation
chạy trên đó thì **đúng lúc app bận nhất là lúc nó giật nhất** — tức là đúng
những khoảnh khắc người dùng để ý nhất.

`<Tap>` đã lo phản hồi nhấn bằng Reanimated. Dùng nó là xong.

### 2.2 Danh sách: `<List>`, không bao giờ `FlatList`

ESLint chặn cứng `import { FlatList }`. Ba luật đi kèm:

- Ô là **component đặt tên**, không phải hàm vô danh trong `renderItem`.
- Ảnh trong ô **phải** có `recyclingKey`.
- Trộn nhiều kiểu ô thì phải khai `getItemType`.

Thiếu một cái là mất sạch cái lợi của tái dùng ô.

### 2.3 Ảnh: `<Img>`, không bao giờ `<Image>`

`<Image>` của RN tải lại ảnh mỗi lần component vào lại màn. Với một app mà nội
dung **chính là ảnh**, đây không phải chi tiết nhỏ.

### 2.4 Không object nào được dựng trong lúc vẽ

```tsx
<View style={{ marginTop: 12 }} />                          // SAI — ESLint chặn
<List renderItem={({item}) => <Row item={item} />} />        // SAI
```

Áp cho `style`, `renderItem`, `keyExtractor`, và mọi hàm truyền xuống con.

> React Compiler ghi nhớ giúp phần lớn chỗ này, nhưng **không** cứu được
> `style={{…}}` viết thẳng trong JSX và không cứu được `<FlatList>`.
> Đừng dựa vào nó để lười.

Ngoại lệ được phép: `style={[s.box, { width: size }]}` — phần cố định đã nằm
trong `StyleSheet`, phần tính theo máy hay theo props thì buộc phải dựng lúc chạy.

### 2.5 Đọc kho trạng thái bằng selector

```tsx
const phase = useAuth((s) => s.phase);   // ĐÚNG — chỉ vẽ lại khi mẩu này đổi
const { phase } = useAuth();             // SAI  — vẽ lại khi BẤT KỲ trường nào đổi
```

### 2.6 Ba thứ phải chạy trên luồng gốc

Cuộn, kéo thả, phản hồi nhấn. Cả ba đều là Reanimated hoặc Gesture Handler.

### 2.7 Vòng chờ có độ trễ

`<Loading>` không hiện gì trong 220ms đầu. Vòng xoay loé lên rồi tắt trong
100ms làm màn hình **trông** giật, dù không có gì chậm cả.

## 3 · Những chỗ đã tính trước trong code

| Chỗ | Làm gì | Nếu không |
|---|---|---|
| `Tap.tsx` | Lún nút bằng Reanimated | Nút không kịp lún khi JS bận → người dùng bấm hai lần |
| `Shutter.tsx` | Lõi co bằng Reanimated | Đúng lúc chụp (JS bận nhất) là lúc nút đơ |
| `Halo.tsx` | Nhịp thở trên luồng UI + tắt khi bật "giảm chuyển động" | Hiệu ứng nền giật theo mỗi lần JS bận |
| `Txt.tsx` | Style dựng sẵn lúc nạp module | Mọi chữ trong app dựng lại object mỗi lần vẽ |
| `Stack.tsx` | Tám bậc khoảng cách dựng sẵn | `<Spacer>` dựng object mỗi lần vẽ |
| `Field.tsx` | Viền đổi **màu**, không cộng thêm viền | Ô cao thêm 2px khi focus → cả màn nhích một nấc |
| `HelperText.tsx` | Luôn chiếm chỗ | Lỗi hiện ra đẩy nút xuống dưới ngón tay đang chạm |
| `CameraScreen.tsx` | Khung ngắm theo chiều **ngang** | Máy dài kéo khung ra, bố cục vỡ |
| `useCountdown.ts` | Tính từ mốc thời gian thật | Ra nền 20 giây rồi vào lại là đếm sai 20 giây |

## 4 · Chưa làm — việc còn lại

- [ ] **Đo trên máy thật.** Mọi thứ trên đây là quyết định đúng về nguyên tắc;
      chưa có số đo trên máy Android tầm trung. Cần: Android tầm trung + iPhone
      đời cũ, đo số khung hình lúc cuộn feed và lúc mở camera.
- [ ] `react-native-mmkv` khi chuyển sang development build (đọc/ghi đồng bộ,
      không qua cầu bất đồng bộ).
- [ ] Nén ảnh trước khi gửi — chưa có luồng gửi.
- [ ] Nạp trước ảnh của ô kế tiếp trong feed.
- [ ] `expo-updates` để vá lỗi không cần chờ duyệt store.

## 5 · Cách tự kiểm

```bash
npx expo export --platform all --clear
```

Ba thứ cần thấy trong log:
1. `React Compiler enabled`
2. Kích thước gói iOS/Android — hiện **4.4MB / 4.6MB** bytecode Hermes.
   Tăng vọt đột ngột nghĩa là có ai kéo vào một thư viện nặng.
3. Không có cảnh báo nào.

Trên máy thật: bật **Perf Monitor** trong menu lắc máy, cuộn feed, xem số khung
hình. Dưới 55 fps trên máy tầm trung là có chỗ hỏng.
