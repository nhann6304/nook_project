# Nook — Hệ thống giao diện

Nguyên tắc, điều hướng, component, chuyển động, chữ nghĩa, luật hai nền tảng, và cách
làm cho app hút người dùng. Màu và chữ lấy từ [`01-brand.md`](01-brand.md); từng màn
cụ thể xem [`03-screen-specs.md`](03-screen-specs.md).

---

## 1. Năm nguyên tắc

1. **Tối và trầm, mặc định.** Nền gần đen ấm, một điểm nhấn đất nung. Không có chế độ sáng ở V0.1 — ảnh nổi lên trên nền tối, và app này hay được mở buổi tối.
2. **Ảnh là ngôi sao, UI lùi lại.** Không viền dày, không bóng đổ, không icon rườm rà quanh ảnh.
3. **Không có gì để so sánh.** Không số like công khai, không bảng xếp hạng, không đếm follower. Mọi con số chỉ hai người trong cặp thấy.
4. **Tròn, mềm, không góc nhọn.** Bo góc lớn ở mọi nơi.
5. **Mỗi màn đúng một điểm sáng.** Nút chụp, hào quang sau dấu hiệu, badge mật ong — mỗi màn chỉ một thứ được phép sáng nhất. Hai điểm sáng là không có điểm nào.

---

## 2. Điều hướng

Hai tầng, và ranh giới giữa chúng là một quyết định về sản phẩm chứ không phải
chuyện kỹ thuật.

### Tab — ba chỗ đi đi lại lại cả ngày

```
Khoảnh khắc   ·   Camera   ·   Trò chuyện
```

Camera nằm **giữa** vì nó là màn mặc định và là việc chính — chỗ ngón cái rơi
vào. Chuyển giữa ba tab dùng `navigate`, **không** `push`: không ai "quay lại"
khỏi màn camera, nên chuyển tab không được đẻ ra lịch sử.

Camera nằm trong tab nên nó **không bị tháo** khi sang Khoảnh khắc — quay lại
chụp là tức thì, không phải chờ camera khởi động lại (300–500ms thấy được bằng
mắt trên máy tầm trung).

Thanh tab **tự vẽ** (`<TabBar>`), không dùng thanh mặc định của navigator:
thanh mặc định mang theo chiều cao, nền và nhãn của hệ điều hành — ba thứ khác
nhau giữa iOS và Android, đúng loại khác nhau mà cả dự án đang tránh.

Nó **chiếm chỗ thật**, không nổi đè lên nội dung. Nổi đè thì mọi màn phải tự
chừa đệm đáy đúng bằng chiều cao thanh, và chỉ cần một màn quên là dòng cuối bị
che. Màn trong tab dùng `<Screen edges={['top']}>`.

### Đẩy chồng — chỗ vào rồi ra

Góc · Cài đặt · một cuộc trò chuyện cụ thể. Những màn này **có nút quay lại**
(`<TopBar onClose>`) và có nghĩa "ở trên" màn trước.

### Luật cũ đã bỏ

Trước 01/09/2026 Nook chốt "không thanh tab, điều hướng bằng cử chỉ". Bỏ vì
**cử chỉ chưa bao giờ tồn tại trong code** — vuốt lên để mở Khoảnh khắc chưa
từng được viết, chỉ có một cái nút ở chân màn. Trên thực tế người dùng không có
cử chỉ nào để học, chỉ có vài cái nút nằm rải ở ba góc khác nhau.

Cử chỉ giấu thì đẹp, nhưng chỉ đẹp với người **đã biết** nó tồn tại.

---

## 3. Thư viện component

Cửa duy nhất là **`@ui`** (`src/components/index.ts`). Màn hình không bao giờ
import thẳng đường dẫn con, và không bao giờ tự dựng lại một cái nút.

**Mảnh cơ bản**

| Component | Đặc tả |
|---|---|
| `Txt` | Sáu cấp chữ, ba mức mờ, phóng to có giới hạn |
| `Tap` | Phản hồi nhấn chạy trên luồng UI (Reanimated). Mọi thứ bấm được đều đi qua đây |
| `Button` | Bốn dáng. Chính: dải màu `gradient.warm`, chữ **tối** `onAccent`, bo 24, cao **52**. **Mỗi màn đúng MỘT** |
| `IconButton` | Vùng chạm 48 dù icon nhỏ. `label` bắt buộc |
| `Field` | Ô nhập cao **52**, bo 20, viền luôn có sẵn, chỉ đổi màu khi focus / lỗi |
| `CaptionField` | Ô nhập nổi **trên ảnh** — nền mờ, không viền, chữ căn giữa |
| `HelperText` | Dòng phụ dưới ô nhập, **luôn chiếm chỗ** để lỗi không đẩy layout |
| `CodeInput` | Sáu ô mã, một ô nhập thật trong suốt phủ lên trên để giữ tự điền mã |
| `ComposerField` | Ô soạn tin dạng viên thuốc + nút gửi. Nút chỉ **sáng lên** khi đã có chữ |
| `Segmented` | Thanh chuyển hai/ba chế độ, con trượt chạy bằng Reanimated |
| `Img` | Bọc `expo-image`. Trong danh sách **bắt buộc** truyền `recyclingKey` |

**Bố cục**

| Component | Đặc tả |
|---|---|
| `Screen` | Nền `bg`, vùng an toàn, đệm ngang 16, tránh bàn phím |
| `Row` `Col` `Spacer` `Flex` | Xếp khối. `gap` chỉ nhận tên trong thang khoảng cách, không nhận số |
| `Card` `Pill` `Divider` | Ba bề mặt. `Pill onPhoto` = nền mờ khi đè lên ảnh |
| `List` | Bọc **FlashList**, không bao giờ FlatList |
| `TopBar` | Nút đóng · tiêu đề · chỗ nút phải. Nook tắt header của navigator nên không có nút quay lại nào khác |
| `Scroll` | Bọc ScrollView. `horizontal` dùng khuôn đệm riêng — đệm đáy 32 của bản dọc mang sang bản ngang là hàng bỗng cao thêm 32pt |
| `TabBar` | Ba tab ở đáy. Chiếm chỗ thật, không nổi đè |

**Thương hiệu**

| Component | Đặc tả |
|---|---|
| `Rings` | Dấu hiệu "Ôm", dựng bằng **SVG**. `ghost` = vòng ngoài đứt nét |
| `Wordmark` | Chữ "nook" **vẽ bằng SVG**, hai chữ "o" chính là hai vòng. Xem `01-brand.md` §1.3 |
| `Halo` | Hào quang ba vòng lồng nhau, không cần gradient |
| `GhostFrame` | Khung đứt nét (SVG — Android vẽ `dashed` + `borderRadius` thành nét **liền**) |
| `Avatar` | Tròn, viền 2,5 theo thang độ thân, ngủ đông = viền đứt |

**Phản hồi**

| Component | Đặc tả |
|---|---|
| `EmptyState` | Hình + một câu + một nút. Không bao giờ chỉ có chữ, không bao giờ có nhân vật |
| `Loading` | Vòng xoay, **trễ 220ms** — dưới ngưỡng đó không hiện gì |

Còn thiếu, làm khi tới màn cần:

| Component | Đặc tả |
|---|---|
| `Toast` | Trượt từ trên, nền mật ong (mở khoá) hoặc `surfaceRaised` (lỗi), tự ẩn sau 3s |
| `Skeleton` | Khối `surface` sáng dần rồi tối lại, 1,2s — **thay cho mọi vòng xoay** |
| `Sheet` | Nền `surfaceRaised`, bo trên 24, kéo xuống để đóng |
| `Switch` | Công tắc cài đặt, bật = `accent` |
| `SettingRow` | Hàng cài đặt: icon + tiêu đề + mô tả + mũi tên |

> **Không có hằng số màu.** `@design` không xuất `color` nữa. Màu lấy qua
> `useColors()` (màu rời) hoặc `useStyles(make)` (StyleSheet). Đây không phải
> quy ước mà là **cấu trúc**: không có cách nào lấy được màu ngoài hai cửa đó,
> nên không có cách nào viết một style chết cứng màu. Xem `09-i18n.md` là khuôn
> tương tự cho chữ.

> **Component không biết kho chữ tồn tại.** Mọi chữ — kể cả nhãn trợ năng —
> nhận qua props (`<Rings label={…}>`, `<CodeInput label={…}>`). ESLint chặn
> chữ tiếng Việt trong `src/components/`. Nhờ vậy component xem trước được mà
> không cần dựng cả app. Xem `09-i18n.md` §10.

Bo góc: 12 (thẻ nhỏ) · 16 (ảnh, ô mã) · 20 (thẻ lớn, ô nhập) · 24 (nút, thẻ ảnh
trong feed) · **44 (khung ngắm camera)** · tròn (avatar, pill, thanh chuyển).

Khung ngắm bo đậm hơn hẳn thẻ ảnh vì nó to hơn hẳn: cùng một độ bo đặt trên ô
360pt thì trông vuông vức, đặt trên ô 160pt thì trông tròn. Độ bo phải đi theo
kích thước mới giữ được cùng một cảm giác.

Vùng chạm tối thiểu **48**, không ngoại lệ. Chữ nhỏ bấm được thì bọc `hitSlop`.

---

## 4. Hai nền tảng

Một bộ code, hai cái máy khác nhau. Sáu chỗ phải xử riêng:

| Chỗ | iPhone | Samsung / Android |
|---|---|---|
| Chắn trên | Đảo động, chừa ~59px | Lỗ camera, chừa ~36px |
| Chắn dưới | Vạch cử chỉ, chừa 34px | Vạch cử chỉ ~24px, hoặc ba nút ~48px |
| Bàn phím | App tự đẩy nội dung (`KeyboardAvoidingView` với `behavior="padding"`) | Hệ điều hành co màn — cần `android:windowSoftInputMode="adjustResize"` |
| Tự điền mã | `textContentType="oneTimeCode"` | `autoComplete="sms-otp"` |
| Cỡ chữ hệ thống | Hay để mặc định | Hay để lớn hơn — thử mọi màn ở mức lớn nhất |
| Bề ngang hẹp nhất | 375 (iPhone SE) | 360 (S24 và phần lớn máy phổ thông) |

Hai luật rút ra từ bảng trên:

- **Không đóng cứng con số theo chiều dọc.** Mọi kích thước tính theo chiều ngang máy
  hoặc theo vùng an toàn. Khung ngắm camera là 88% chiều ngang, không phải 60% chiều dọc.
- **Đổi kiểu bàn phím thì dựng lại ô nhập** (`key={method}`). Android không đổi kiểu
  bàn phím trên một ô đang focus — người dùng chọn "Số điện thoại" mà vẫn thấy bàn phím chữ.

---

## 5. Chuyển động

Ít nhưng đúng chỗ. Ease-out, 150–320ms (`motion` trong tokens).

| Chỗ | Chuyển động | Rung |
|---|---|---|
| Nút chụp | Thu nhỏ còn 0,92 khi nhấn | medium |
| Ảnh gửi đi | Bay lên, nhỏ dần về phía avatar góc trên, 320ms | success |
| App icon màn chào mừng | Trôi lên xuống 8px, 1,7s một chiều | — |
| Vòng lên cấp khi mở khoá | Vòng ngoài sáng dần lên một nấc, 600ms | success |
| Hào quang màn chào mừng | Độ đục 0,55 ⇄ 1 · cỡ 0,94 ⇄ 1,08, 1,5s, lệch nhịp với icon | — |
| Đổi Email ⇄ Số điện thoại | Ô sáng trượt ngang 200ms | selection |
| Mã sai | Sáu ô rung ngang ±6px, 300ms, rồi xoá sạch | error |
| Vòng lên cấp | Màu chuyển dần 600ms | success |
| Mở khoá tính năng | Vòng độ thân sáng lên một nấc, toast mật ong, **đúng 3 hạt confetti** | success |
| Chỗ mới trong góc | Vòng đứt nét nở từ 0,8 → 1 | light |

Máy bật "giảm chuyển động" thì tắt hết chuyển động lặp vô hạn — kiểm bằng
`AccessibilityInfo.isReduceMotionEnabled()`, không làm công tắc riêng trong app.

Không dùng: vòng xoay chờ (dùng skeleton), nảy đàn hồi, hiệu ứng lò xo quá đà.

---

## 6. Chữ nghĩa

Giọng: **bạn bè nhắn tin, không phải hệ thống thông báo.** Xưng "bạn", không "quý khách",
không dấu chấm than.

| Tình huống | Viết thế này | Đừng viết |
|---|---|---|
| Màn chào mừng | "Góc nhỏ của tụi mình" | "Kết nối bạn bè mọi lúc mọi nơi!" |
| Đăng nhập | "Nook gửi bạn một mã 6 số. Không mật khẩu, không có gì để nhớ." | "Vui lòng nhập email để tiếp tục" |
| Email sai định dạng | "Email này trông chưa đúng. Xem lại giúp nhé." | "Email không hợp lệ" |
| Không gửi được mã | "Chưa gửi được mã. Thử lại nhé." | "Gửi OTP thất bại" |
| Mã sai | "Mã không đúng. Thử lại nhé." | "Sai mã xác thực" |
| Mã hết hạn | "Mã đã hết hạn. Gửi lại nhé." | "OTP expired" |
| Đang kiểm tra | "Đang kiểm tra…" | "Loading..." |
| Feed trống | "Hết rồi. Chụp gì đó đi." | "Không có bài viết nào." |
| Góc trống | "Góc của bạn đang trống. Mời người đầu tiên." | "Bạn chưa có bạn bè." |
| Widget chưa có ảnh | "Chưa có gì mới" | "Không có dữ liệu" |
| Gửi xong | "Đã vào góc" | "Đăng thành công!" |
| Lên cấp | "Bạn và Minh vừa mở Album chung." | "Chúc mừng! Bạn đã đạt Level 3!" |
| Ngủ đông | "Lâu rồi chưa có gì mới với Minh." | "Tình bạn của bạn đang giảm!" |
| Hết chỗ | "Góc đã đầy. Thân hơn với người đang có sẽ mở thêm chỗ." | "Nâng cấp để thêm bạn." |
| Lỗi mạng | "Chưa gửi được. Thử lại nhé." | "Error 500." |

Ba từ cấm trong toàn app: **điểm, hạng, nhiệm vụ.** Thay bằng: ký ức, cấp độ, hành trình.
Không dùng chữ kỹ thuật với người dùng: không "OTP", không "xác thực", không "hợp lệ" —
viết là "mã", "kiểm tra", "trông chưa đúng".

**Chữ không nằm trong màn hình.** Toàn bộ câu chữ ở `src/i18n/locales/vi.ts`,
và mỗi câu phải có bản tiếng Anh ở `en.ts` — thiếu là không biên dịch được.
Bảng trên áp cho **cả hai** thứ tiếng: tiếng Anh cũng cấm *points* / *rank* /
*quest*, cũng không viết *verify* / *valid* / *session*. Cách thêm một câu:
[`09-i18n.md`](09-i18n.md).

---

## 7. Làm sao để hút người dùng

Mười đòn, xếp theo thứ tự ăn tiền. Mỗi đòn gắn với một chỗ cụ thể trong app.

1. **Ba giây đầu phải có một thứ động đậy.** Màn chào mừng: app icon trôi lên xuống, hào quang thở lệch nhịp. Màn tĩnh hoàn toàn trông như ảnh chụp màn hình bị treo.
2. **Đăng nhập gọn dưới 15 giây.** Một ô nhập, một nút, mã tự điền. Mỗi ô nhập thêm là một phần trăm người dùng rơi rụng.
3. **Không bao giờ có màn rỗng câm.** Mọi danh sách trống đều là khung đứt nét + một câu + một nút. Khung đó đọc ra "chỗ này lẽ ra có một tấm ảnh" — nói đúng cái đang thiếu.
4. **Skeleton thay vòng xoay.** Vòng xoay nói "chờ đi"; skeleton nói "sắp có rồi, hình dạng thế này".
5. **Một điểm sáng mỗi màn.** Mắt người tìm điểm sáng nhất trước — cho nó đúng thứ mình muốn họ bấm.
6. **Chuyển động có hướng thì kể được chuyện.** Ảnh gửi đi bay về phía avatar góc trên: người dùng *thấy* ảnh đi tới bạn bè.
7. **Rung đúng năm chỗ:** bấm chụp (medium), gửi xong (success), đổi chế độ đăng nhập (selection), mã sai (error), mở khoá (success).
8. **Gọi tên người dùng sớm.** Ngay sau khi đặt tên: *"Chào {tên}"*. Ô nhắn ghi *"Nhắn riêng cho Minh…"*.
9. **Phần thưởng đến trước lời mời.** Cho chụp và lưu khoảnh khắc đầu tiên **trước khi** bắt mời bạn. Người ta bỏ app ở đúng chỗ bị đòi mời bạn mà chưa thấy app làm được gì.
10. **Widget là đòn lan truyền mạnh nhất.** Mặt bạn bè hiện thẳng trên màn hình chủ, không cần mở app. Xem [`04-widget.md`](04-widget.md).

Ba thứ **không** làm, dù thấy app khác làm:
- Không màn hình chờ có logo 2 giây. Mở app là thấy camera.
- Không hộp thoại xin đánh giá 5 sao trong 7 ngày đầu.
- Không thông báo "bạn bè đang chờ bạn quay lại".
