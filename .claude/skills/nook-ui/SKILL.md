---
name: nook-ui
description: Luật dựng giao diện của Nook (React Native + Expo). Dùng skill này MỖI KHI viết hoặc sửa bất kỳ file .tsx nào trong frontend/app/ hoặc frontend/src/ — thêm màn hình, thêm component, chỉnh màu, chỉnh khoảng cách, thêm animation, thêm danh sách, thêm ảnh. Nó nói rõ được dùng cái gì có sẵn, cái gì bị cấm, và vì sao.
---

# Dựng giao diện Nook

Đọc file này TRƯỚC khi gõ dòng `.tsx` đầu tiên. Ba câu tóm tắt:

1. **Không tự chế.** Mọi thứ nhìn thấy được đều đã có sẵn trong `@ui`.
2. **Không viết số.** Màu, khoảng cách, bo góc, thời lượng đều nằm trong `@design`.
3. **Không viết chữ.** Mọi câu hiện cho người dùng nằm trong `@i18n`, hai thứ tiếng.
4. **Mượt là yêu cầu, không phải điểm cộng.** Xem mục "Luật hiệu năng".

ESLint chặn cứng cả bốn. Nếu bạn thấy mình đang tìm cách lách nó — dừng lại,
gần như chắc chắn là đang đi sai đường.

---

## 1 · Tìm mảnh mình cần

Trước khi viết một component mới, tra bảng này. Cột phải là thứ **đã có**.

| Cần gì | Dùng | Đừng dùng |
|---|---|---|
| Chữ | `<Txt variant tone>` | `<Text>` của react-native |
| Nút chữ | `<Button label variant>` | `<TouchableOpacity>` |
| Nút icon | `<IconButton label>` | `<Pressable>` trần |
| Bất kỳ thứ gì bấm được khác | `<Tap>` | `<Pressable>` trần |
| Ô nhập | `<Field>` | `<TextInput>` |
| Ô nhập nổi trên ảnh | `<CaptionField>` | `<Field>` (có viền, dán đè lên ảnh) |
| Dòng phụ dưới ô nhập | `<HelperText>` | `<Txt>` tự đặt |
| Ô nhập mã 6 số | `<CodeInput>` | sáu `<Field>` |
| Chuyển 2–3 chế độ | `<Segmented>` | hai nút tự tô màu |
| Ảnh | `<Img>` | `<Image>` của RN hoặc expo-image trực tiếp |
| Khung màn hình | `<Screen>` | `<SafeAreaView>` |
| Xếp ngang / dọc | `<Row>` `<Col>` | `style={{flexDirection:…}}` |
| Đẩy xuống đáy | `<Flex />` | `marginTop:'auto'` |
| Thẻ | `<Card>` | `<View>` tự tô nền |
| Nhãn bo tròn | `<Pill>` | `<View>` tự bo |
| Kẻ ngang | `<Divider>` | `<View style={{height:1}}>` |
| Danh sách dữ liệu | `<List>` (FlashList) | `<FlatList>` — **cấm** |
| Cuộn nội dung ngắn | `<Scroll>` | `<ScrollView>` |
| Ảnh đại diện + vòng thân | `<Avatar>` | tự vẽ vòng |
| Dấu hiệu hai vòng | `<Rings>` | ảnh PNG |
| Chữ "nook" | `<Wordmark>` | `<Txt>` với font display |
| Vầng sáng | `<Halo>` | gradient tròn |
| Khung "lẽ ra có ảnh" | `<GhostFrame>` | `borderStyle:'dashed'` |
| Màn trống | `<EmptyState>` | một dòng chữ giữa màn |
| Vòng chờ | `<Loading>` | `<ActivityIndicator>` |
| **Bất kỳ chữ nào hiện ra** | `t('khoá')` từ `@i18n` | viết thẳng câu vào JSX — **ESLint chặn** |

**Thiếu mảnh?** Thêm vào `src/components/`, xuất ở `src/components/index.ts`,
rồi thêm một dòng vào bảng trên. Đừng dựng tại chỗ trong màn hình.

---

## 2 · Không viết số

```tsx
import { color, space, radius, type, duration, spring, layout } from '@design';
```

| Loại | Lấy từ | Ví dụ |
|---|---|---|
| Màu | `color.*` | `color.accent`, `color.textMuted` |
| Trong suốt | `alpha.*` | `alpha.scrim`, `alpha.glowSoft` |
| Dải màu | `gradient.warm` | |
| Khoảng cách | `space.*` | `xs 4 · sm 8 · md 12 · lg 16 · xl 20 · xxl 24 · xxxl 32 · huge 48` |
| Bo góc | `radius.*` | `sm 12 · md 16 · lg 20 · xl 24 · frame 32 · full 999` |
| Cỡ chữ | `type.*` qua `<Txt variant>` | `display · title · section · body · label · faint` |
| Thời lượng | `duration.*` | `instant 90 · fast 150 · base 220 · slow 320` |
| Độ nảy | `spring.*` | `press · enter · gentle` |
| Bóng | `elevation.*` | `glowAccent` |
| Rung | `@/lib/haptics` | `tap() confirm() capture() select() reject()` |

Cần màu mới → thêm vào `src/design/tokens.ts` **kèm lý do và số đo tương phản**,
đừng thả hex vào chỗ đang code.

Cần `13px`? Không có. Thang khoảng cách là bội số của 4 và đó là chủ đích —
`space.md` (12) hoặc `space.lg` (16). Chênh 1px không ai thấy; ba mươi con số
lẻ rải khắp code thì ai cũng thấy.

---

## 3 · Luật hiệu năng

**Đây là yêu cầu số một của dự án.** App phải mượt, không phải "chạy được".
Mỗi luật dưới đây tương ứng với một kiểu lag người dùng cảm nhận được.

### 3.1 Animation chạy trên luồng UI, luôn luôn

```tsx
// ĐÚNG — Reanimated, chạy trên luồng UI
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

// SAI — Animated của react-native, chạy trên luồng JS
import { Animated } from 'react-native';
```

Vì sao: luồng JS là luồng đang mở camera, đang giải mã ảnh, đang gọi mạng.
Animation chạy trên đó thì đúng lúc app bận nhất là lúc nó giật nhất — tức là
đúng những khoảnh khắc người dùng để ý nhất.

`<Tap>` đã lo phản hồi nhấn bằng Reanimated. Dùng nó là xong, không phải nghĩ.

### 3.2 Danh sách: `<List>`, không bao giờ `FlatList`

FlatList dựng ô mới từ đầu mỗi lần cuộn tới. FlashList tái dùng ô đã cuộn qua.
Ba luật đi kèm, thiếu một cái là mất sạch cái lợi:

- Ô phải là **component đặt tên**, không phải hàm vô danh trong `renderItem`.
- Ảnh trong ô **phải** có `recyclingKey`.
- Danh sách trộn nhiều kiểu ô phải khai `getItemType`.

### 3.3 Ảnh: `<Img>`, không bao giờ `<Image>`

`<Img>` bọc expo-image: có cache đĩa, giải mã ngoài luồng chính. `<Image>` của
RN tải lại ảnh mỗi lần component vào lại màn.

### 3.4 Không có object nào được dựng trong lúc vẽ

```tsx
// SAI — object mới mỗi lần vẽ, phá memo, ESLint chặn
<View style={{ marginTop: 12 }} />
<List renderItem={({ item }) => <Row item={item} />} />

// ĐÚNG — dựng một lần lúc nạp module
const s = StyleSheet.create({ box: { marginTop: space.md } });
<View style={s.box} />
<List renderItem={MomentRow} />
```

Áp cho cả `style`, `renderItem`, `keyExtractor`, và mọi hàm truyền xuống con.
Hàm dựng trong lúc vẽ thì dùng `useCallback`; giá trị tính toán thì `useMemo`.

> React Compiler đang bật (`experiments.reactCompiler` trong `app.json`) và tự
> ghi nhớ phần lớn chỗ này. Nhưng nó **không** cứu được `style={{…}}` viết thẳng
> trong JSX và không cứu được `<FlatList>`. Đừng dựa vào nó để lười.

### 3.5 Đọc kho trạng thái bằng selector

```tsx
// ĐÚNG — chỉ vẽ lại khi đúng mẩu này đổi
const phase = useAuth((s) => s.phase);

// SAI — vẽ lại khi BẤT KỲ trường nào trong kho đổi
const { phase } = useAuth();
```

### 3.6 Ba thứ không bao giờ được chạy trên luồng JS mỗi khung hình

Cuộn, kéo thả, và phản hồi nhấn. Cả ba đều phải là Reanimated hoặc Gesture Handler.

---

## 4 · Luật giao diện không được phá

Lấy từ `frontend/docs/02-ui-system.md`, nhắc lại ở đây vì hay bị quên nhất:

- Nền tối `color.bg` mặc định. **Không làm chế độ sáng ở V0.1.**
- **Mỗi màn đúng MỘT nút `variant="primary"`.** Hai cái là không màn nào nổi.
- Chữ trên nút primary là màu **tối** (`color.onAccent`), không phải trắng.
  Chữ trắng trên dải cam–hồng chỉ đạt 2.3:1 — không đọc được ngoài nắng.
- Khung ngắm camera tính theo **chiều ngang** máy (88%), không theo chiều dọc.
- **Không có thanh tab.** Điều hướng bằng cử chỉ.
- **Không có linh vật.** Chỗ trống dùng `<GhostFrame>` hoặc lưới mười chỗ.
- Logo và wordmark **chỉ** ở màn Chào mừng. Trong app không tự giới thiệu nữa.
- Vùng chạm tối thiểu `layout.minTouch` (48). Icon nhỏ vẫn phải có vùng chạm to.
- `color.textDisabled` **không phải màu chữ đọc được** (2.55:1). Chữ nhỏ nhất
  mà người ta phải đọc là `tone="faint"`.
- Không hiện số like/lượt xem công khai, không bảng xếp hạng giữa bạn bè.
- Cấp thân chỉ hai người trong cặp nhìn thấy.

---

## 5 · Chữ nghĩa

**Không có câu nào viết thẳng vào màn hình.** Chữ nằm ở `src/i18n/locales/vi.ts`,
và mỗi câu phải có bản tiếng Anh ở `en.ts`.

```tsx
const t = useT();                              // import { useT } from '@i18n'
<Txt>{t('feed.emptyTitle')}</Txt>
<Txt>{t('verify.resendIn', { seconds: 42 })}</Txt>
<Txt>{t('feed.minutesAgo', { count: 3 })}</Txt>  // số nhiều
```

Thêm một câu: viết vào `vi.ts` → **tsc lập tức báo đỏ ở `en.ts`** → dịch → dùng.
Không có bước đăng ký nào khác. Chi tiết: `frontend/docs/09-i18n.md`.

Bốn thứ tsc bắt được ngay: gõ sai khoá · thiếu bản dịch · quên tham số · thừa
tham số. Ngoài React (trong `*Api.ts`) thì dùng `translate()` thay `useT()`.

**Component trong `src/components/` KHÔNG được gọi `t()`** — nhãn trợ năng nhận
qua props (`<Rings label>`, `<Avatar label>`, `<CodeInput label>`). Người gọi
mới là người dịch.

### Giọng — áp cho cả tiếng Việt lẫn tiếng Anh

Ba từ **cấm**: *điểm*, *hạng*, *nhiệm vụ* — tiếng Anh: *points*, *rank*,
*quest/mission*.

Không dùng chữ kỹ thuật: không "OTP", không "xác thực", không "hợp lệ",
không "token", không "session" — *verify*, *valid*, *session* cũng vậy.

| Đừng viết | Viết |
|---|---|
| Mã OTP không hợp lệ | Mã không đúng. Bạn thử nhập lại nhé. |
| Xác thực thành công | Xong rồi, chào bạn |
| Lỗi kết nối | Mạng đang chập chờn. Thử lại giúp mình nhé. |
| Danh sách trống | Góc này còn chờ chín người |

Câu lỗi phải nói **làm gì tiếp**, không chỉ nói cái gì hỏng.

Câu tiếng Anh dài hơn câu tiếng Việt cùng nghĩa khoảng 15–20%. Chỗ chật (nhãn
nút, pill) thì **viết ngắn lại**, đừng dịch sát rồi để nó tràn ra khỏi nút.

---

## 6 · Hai nền tảng

Không màn nào được biết mình đang chạy trên máy gì. Bốn luật giữ điều đó đúng:

1. **Chắn tai thỏ / thanh điều hướng**: hỏi `<Screen edges>`, không gõ số tay.
2. **Ngang tính theo phần trăm**, dọc để chỗ thừa rơi vào khoảng thở
   (`justifyContent: 'space-between'` + `<Flex/>`), không kéo giãn nội dung.
3. **Khối chữ chặn trần** `layout.maxTextWidth` — máy gập mở ra không kéo dòng
   thành 90 ký tự.
4. **Bàn phím**: iOS dùng `<Screen keyboard>`; Android đã có `adjustResize`
   trong `app.json`. Đừng làm cả hai cùng lúc, màn sẽ co hai lần.

Bẫy hai nền tảng đã gặp, đừng đạp lại:

- `<Field key={method}>` — đổi kiểu bàn phím mà không thay key thì **Android**
  giữ nguyên bàn phím cũ. iOS thì đổi được, nên bug này chỉ hiện trên một máy.
- `borderStyle:'dashed'` + `borderRadius` → **Android** vẽ ra nét **liền**.
  Nét đứt phải vẽ bằng SVG (`<GhostFrame>`, `<Rings ghost>` đã làm sẵn).
- Ba nút điều hướng của Android chiếm chỗ thật ở đáy; iPhone chỉ có thanh gạt.

---

## 7 · Cấu trúc file

Mọi đường dẫn dưới đây tính từ **`frontend/`**. Mã app không bao giờ nằm ở gốc
dự án — gốc chỉ có `docs/`, `frontend/`, `backend/`.

```
app/                    CHỈ điều hướng. Không logic, không style.
src/design/             token + style chung. Nơi DUY NHẤT được viết hex.
src/components/         bộ component. Xuất qua src/components/index.ts.
src/features/<tên>/     theo tính năng: screens/ components/ lib/ store/
src/i18n/               kho chữ hai thứ tiếng. Cửa duy nhất: '@i18n'.
src/hooks/  src/lib/    dùng chung. src/lib là TS thuần, không React.
src/mocks/              dữ liệu giả. Xoá khi có server.
```

**Màn hình không được biết router tồn tại.** Nó nhận `onX` qua props rồi gọi.
File trong `app/` là chỗ nối màn hình với router và với kho trạng thái.
Nhờ vậy màn hình test được và xem trước được mà không cần dựng cả app.

**Màn hình không được biết server tồn tại.** Mọi lệnh gọi mạng nằm trong
`src/features/<tên>/lib/*Api.ts`.

---

## 8 · Trước khi coi là xong

```bash
cd frontend && npm run check     # tsc --noEmit && eslint --max-warnings=0
```

Cả hai phải sạch. ESLint ở đây không bắt lỗi cú pháp — nó giữ đúng lời hứa
trong file này. Một cảnh báo là một chỗ đã lách ra ngoài hệ thống.
