# Nook — Thương hiệu

Logo, app icon, màu, kiểu chữ, linh vật. Đây là những thứ ít thay đổi nhất trong dự án —
sửa một thứ ở đây là sửa cả app, nên sửa thì ghi lý do vào phần cuối file.

Nguyên tắc giao diện và cách lắp màn hình nằm ở [`02-ui-system.md`](02-ui-system.md).

---

## 1. Logo — "Ôm"

Hai vòng: một vòng khép, một vòng vòng tay ôm lấy nó.

Chọn hình này không phải vì nó đẹp, mà vì **nó đã có sẵn trong dự án ở ba chỗ khác** —
giờ chỉ gom về một mối:

| Một hình này | Đang là gì trong dự án |
|---|---|
| Hai chữ **oo** trong wordmark | Hai người trong một góc — ý gốc của cái tên |
| Vòng quanh avatar | Thang độ thân, "thanh tiến độ" duy nhất của app |
| Vòng ôm | Quan hệ hai chiều — điều kiện để có một ký ức |
| Vòng đứt nét | Chỗ trống trong góc: người chưa mời, hoặc bạn đang ngủ đông |

### 1.1 Hình học

Dựng trong khung 100×100 (`assets/logo.svg`):

- **Vòng khép**: tâm `(56, 50)`, bán kính 20, nét dày 9, màu `#FFA166`.
- **Vòng ôm**: cùng bán kính 20, tâm `(40, 50)`, là một cung ~260° hở về phía phải,
  đầu nét bo tròn, màu `#FF7A3D`. Đường: `M50.9 34.7 A20 20 0 1 0 50.9 65.3`.
- **Hai vòng lệch nhau một nấc sáng.** Đây là luật không được phá: cùng một sắc thì
  ở 40px hai vòng dính lại thành một khối, hình mất nghĩa.

Ba biến thể, đủ cho mọi chỗ:

| File | Khi nào dùng |
|---|---|
| `logo.svg` | Trong app: màn chào mừng, màn đăng nhập, nút góc trên trái màn camera |
| `logo-mono.svg` | Thông báo, favicon, in một màu — cả hai vòng `#EFE9E3` |
| `logo-ghost.svg` | Vòng ngoài đứt nét, nghĩa là "còn thiếu một người" — màn Góc trống, widget chưa có ảnh |
| `app-icon.svg` | Icon lên store: dấu hiệu trên nền `#0E0D0C` + một vầng ấm lệch lên trên |

### 1.2 App icon

Dấu hiệu đặt giữa khung bo góc 22, nền `#0E0D0C`, phủ một vầng ấm — gradient toả tròn
tâm `(50%, 34%)`, đất nung từ 22% độ đục về 0 ở mép. Phải là gradient, không phải một
hình tròn mờ: hình tròn để lộ đường biên và ở cỡ lớn nhìn thành vết ố.

Mọi nét nằm trong 82% khung. iOS bo góc kiểu siêu ellipse, Android mỗi hãng bo một
kiểu — nét chạm mép là sẽ bị cắt trên máy nào đó.

**Cách nghiệm thu:** thu icon về 60×60 rồi 40×40, nhìn từ khoảng cách một cánh tay.
Còn tách được **hai** vòng là đạt. Dính thành một khối thì tăng độ lệch sáng giữa hai
vòng, đừng tăng độ dày nét.

### 1.3 Wordmark

Chữ thường **nook**, **vẽ bằng hình chứ không gõ bằng phông chữ**
(`src/components/brand/Wordmark.tsx`).

**Hai chữ "o" CHÍNH LÀ hai vòng của dấu hiệu.** Cái tên và cái dấu hiệu nói cùng
một câu — hai người, một người ôm người kia — nên đặt cạnh nhau chúng không phải
là hai thứ rời rạc dán vào nhau. Vì thế luật màu của dấu hiệu áp nguyên vào đây:

- `o` thứ nhất `#FF7A3D`, `o` thứ hai `#FFA166` — **lệch nhau một nấc sáng**,
  chồng lên nhau 9 đơn vị. Cùng màu là mất ý "hai người", chỉ còn thấy một cục.
- `n` và `k` màu `#EFE9E3`.
- Bản `mono`: cả ba màu về `#EFE9E3`, dùng khi đặt trên nền màu hoặc in một màu.

#### Hình học

Khung `viewBox 214 × 106`, toạ độ là **đường tâm nét**, nét dày 13, hai đầu bo tròn.

| Nét | Đường |
|---|---|
| `n` thân | `M9 84 V46` |
| `n` vòm | `M9 63 A17 17 0 0 1 43 63 V84` |
| `o` ôm | tâm `(86, 63)`, bán kính 21 |
| `o` được ôm | tâm `(132, 63)`, bán kính 21 |
| `k` thân | `M176 18 V84` |
| `k` chéo lên | `M176 70 L202 44` |
| `k` chéo xuống | `M186 60 L205 84` |

Truyền vào component là **chiều cao**, bề ngang tự tính theo tỉ lệ — không kéo
méo được.

#### Vì sao là hình, không phải chữ

1. **Không phụ thuộc phông.** Phông tải hụt là tên thương hiệu rơi về phông hệ
   thống — thứ duy nhất trong app không được phép trông khác đi.
2. Chữ gõ bằng phông thì không nhuộm hai chữ "o" hai màu khác nhau được.
3. Nét không đổi độ dày khi phóng to, và bo tròn đúng bằng nhau ở mọi cỡ. Chữ
   thật thì độ dày nét gắn với cỡ chữ, không tách ra được.

Đã đọc được rõ ở **22pt** — cỡ nhỏ nhất từng dùng. Không xoay, không đổ bóng,
không viền, không đặt lên ảnh nhiều chi tiết.

### 1.4 Logo và wordmark đi cùng nhau

**Không đặt dấu hiệu cạnh wordmark nữa.** Hai chữ "o" đã chính là hai vòng đó
rồi; để cạnh nhau là nói cùng một câu hai lần. Màn Chào mừng chỉ có wordmark.

Trong app thì hoặc dấu hiệu, hoặc chữ — app đã ở trong máy người ta rồi, không
cần tự giới thiệu nữa.

---

## 2. Màu

### 2.1 Song sắc: lửa đất → hồng

Đi qua hai đời trước khi chốt.

**Đời 1 — `#C97B57`, đất nung trầm.** Nhìn một mình thì đẹp, nhưng đặt vào đúng
chỗ nó phải sống thì chìm: trên màn hình chủ cạnh icon bão hoà cao của app khác
thì biến mất; trên nút chính giữa nền gần đen thì trông như mảng dán; cạnh ảnh
chụp buổi tối — thứ chiếm phần lớn app — thì lẫn vào luôn.

**Đời 2 — `#F2703A`, một sắc cam.** Đúng, nhưng nguội. Một sắc duy nhất trải
trên cả nút lẫn hào quang lẫn vòng độ thân thì mọi thứ trông cùng một nhiệt độ,
và app thiếu chỗ để reo lên khi có chuyện vui.

**Đời 3 — song sắc `#FF7A3D` → `#FF4E8A`.** Thêm một sắc hồng ở đầu kia của dải.
Được ba thứ: nút chính có chiều sâu thay vì một mảng phẳng; có màu thứ hai để
dành cho khoảnh khắc vui mà không phải mượn màu báo lỗi; và cặp cam–hồng đứng
cạnh nhau thì nhận ra được từ xa trên một màn hình đầy icon.

Ba lý do giữ họ màu ấm vẫn đúng nguyên:

- **Không đụng ai.** Mạng xã hội đang là một biển xanh dương và tím.
- **Hợp với ảnh chụp người.** Cam-đất cùng họ với da người và ánh đèn trong nhà
  — ảnh selfie buổi tối đặt cạnh nó trông liền một mạch.
- **Ấm chứ không hét.** Đây là app để nhắn với 10 người thân, không phải app tin tức.

Màu chủ đạo được dùng **rất ít**: nút chính, nút chụp, hào quang, vòng độ thân
cấp cao. Một màn có hơn hai vệt màu là đã dùng sai.

**Dải màu ba chặng.** Nút chính và nút chụp tô dải
`#FF8F4D → #FF6E52 → #FF5C90` (chéo 118°, từ trên-trái xuống dưới-phải), cộng
một bóng đổ **cùng màu** chứ không phải bóng đen — nút trông như có ánh sáng
chiếu vào thay vì như miếng giấy dán.

Chặng giữa `#FF6E52` không thừa: nối thẳng cam sang hồng thì quãng ở giữa đi
vòng qua vùng đỏ xỉn, dải trông bẩn. Cần `expo-linear-gradient`.

**Chữ trên dải là màu TỐI `#1A0E08`, không phải trắng.** Số đo trên ba chặng:

| Chữ | trên `#FF8F4D` | trên `#FF6E52` | trên `#FF5C90` |
|---|---|---|---|
| `#1A0E08` (đang dùng) | 8,37:1 | 6,85:1 | 6,47:1 |
| `#FFFFFF` | 2,26:1 | 2,76:1 | 2,92:1 |

Chữ trắng trượt chuẩn ở **cả ba** chặng. Đây là lý do nút chính của Nook có chữ tối.

### 2.2 Bảng màu

| Vai trò | Token | Hex | Tương phản trên nền | Dùng ở đâu |
|---|---|---|---|---|
| Nền | `bg` | `#0E0D0C` | — | Toàn bộ nền app (đen ấm, không đen tuyệt đối) |
| Bề mặt | `surface` | `#1A1817` | — | Thẻ, pill, ô nhập, khung camera |
| Bề mặt nổi | `surfaceRaised` | `#221F1D` | — | Sheet, ô đang focus, hàng được chọn |
| Bề mặt chìm | `surfaceSunken` | `#141312` | — | Chỗ trống, ô mã chưa gõ, rãnh thanh chuyển |
| Viền | `border` | `#332E2A` | — | Viền ô nhập, viền thẻ, viền đứt |
| Viền mảnh | `borderSoft` | `#241F1D` | — | Đường kẻ giữa các hàng danh sách |
| **Lửa đất** | `accent` | `#FF7A3D` | 7,49:1 | Viền focus, icon đang bật, nét nhấn |
| **Hồng** | `accent2` | `#FF4E8A` | 6,20:1 | Điểm nhấn phụ, huy hiệu, tim |
| Lửa đất sáng | `accentBright` | `#FFA166` | 9,75:1 | Hào quang, vòng ngoài của dấu hiệu |
| Lửa đất sâu | `accentDeep` | `#E05A22` | 5,23:1 | Nấc tối khi nhấn giữ |
| Dải nút chính | `gradient.warm` | `#FF8F4D → #FF6E52 → #FF5C90` | — | Nút chính, nút chụp |
| Chữ trên dải | `onAccent` | `#1A0E08` | ≥ 6,47:1 trên mọi chặng | Chữ nằm trên nút chính |
| Chữ chính | `text` | `#EFE9E3` | 16,12:1 | Tên, tiêu đề, nội dung |
| Chữ phụ | `textMuted` | `#A79C93` | 7,23:1 | Nhãn, mô tả, icon phụ |
| Chữ mờ | `textFaint` | `#8A8078` | 5,03:1 | Gợi ý trong ô nhập, thời gian, chú thích |
| Chữ tắt | `textDisabled` | `#5C5249` | 2,55:1 | **Chỉ** chữ đã tắt và nét trang trí |
| Mật ong | `honey` | `#FFC94D` | 12,68:1 | Chuỗi ngày, thành tựu |
| Bạc hà | `mint` | `#4FD1A5` | 10,17:1 | Xong, đã gửi, đang online |
| Tím | `violet` | `#A77BFF` | 6,40:1 | Mới, chưa xem |
| Báo hỏng | `danger` | `#FF6B6B` | 7,00:1 | Xoá tài khoản, mã sai, lỗi |

Ba điều bắt buộc nhớ:

- **Không dùng đen tuyệt đối `#000000`.** Nền hơi ấm giúp ảnh không bị "dán" vào nền và đỡ chói viền trên màn OLED.
- **`textDisabled` không phải màu chữ.** 2,55:1 là dưới chuẩn đọc. Chữ nhỏ nhất phải là `textFaint`.
- **Đỏ chỉ để báo hỏng.** Không dùng đỏ để nhấn mạnh, không dùng đỏ cho badge số.

### 2.3 Luật chia màu trên một màn

Tỉ lệ 60 / 30 / 10: **60%** nền · **30%** bề mặt và chữ · **10%** màu. Trong 10% đó đất
nung chiếm phần lớn; mật ong và bạc hà chỉ xuất hiện đúng lúc có chuyện (mở khoá, ở gần).

Hào quang (`glow` trong tokens) là ba vòng tròn trong suốt lồng nhau, không phải gradient
thư viện. Dùng đúng ba chỗ: sau dấu hiệu ở onboarding, sau nút chụp khi vừa gửi xong, sau
badge lúc mở khoá.

### 2.4 Thang độ thân

Vòng quanh avatar — "thanh tiến độ" duy nhất của app, ấm dần trên nền tối:
`#3D3330` → `#5F4738` → `#8B6043` → `#C07547` → `#FF7A3D` → `#FF5C90` (cấp 1 → 10).
Cấp 9 chạm đúng màu chủ đạo, cấp 10 chớm sang hồng — thân nhất thì đi hết cả dải
của app, không dừng ở giữa.
Ngủ đông: nền `surfaceSunken`, viền đứt `border`.

**Độ thân mã hoá bằng độ ấm của màu, không bao giờ bằng con số hiển thị công khai.**

---

## 3. Kiểu chữ

**Be Vietnam Pro** — miễn phí trên Google Fonts, thiết kế riêng cho tiếng Việt nên dấu
không bị vỡ ở cỡ nhỏ. Đây là điểm nhiều app Việt làm hỏng.

| Cấp | Cỡ | Đậm | Giãn dòng | Dùng cho |
|---|---|---|---|---|
| Tiêu đề màn | 22px | 500 | 28 | Một dòng, đầu màn |
| Tiêu đề mục | 17px | 500 | 22 | Nhóm trong cài đặt |
| Nội dung | 14px | 400 | 20 | Câu mô tả, chat, caption |
| Nhãn phụ | 12px | 400 | 16 | Thời gian, trạng thái |
| Chú thích | 11px | 400 | 16 | Điều khoản, ghi chú cuối màn |
| Số lớn | 22px | 500 | 26 | Ký ức, số ngày, mã 6 số |

Chỉ hai độ đậm: 400 và 500 (600 cho tiêu đề lớn). Wordmark không dùng phông nào
— nó là hình vẽ.

**Không có phông trưng bày riêng.** Trước đây bậc lớn nhất dùng Fredoka. Nhưng
bậc đó chỉ dùng đúng một chỗ — tiêu đề màn Chào mừng — mà tiêu đề đó là tiếng
Việt đầy dấu, đúng loại chữ Fredoka vẽ xấu nhất. Nay bậc đó dùng Be Vietnam Pro
600, và gói `@expo-google-fonts/fredoka` đã gỡ khỏi dự án.

**Chữ phải phóng to được.** Mỗi cấp có `maxScale` trong `theme/tokens.ts` — giới hạn
phóng để layout không vỡ, nhưng không bao giờ khoá `allowFontScaling`. Người dùng
Samsung hay để cỡ chữ lớn hơn iPhone; màn nào cũng phải thử ở mức phóng tối đa.

---

## 4. Không có linh vật

Dự án từng có một con chim non tên Nem. **Đã bỏ, chốt ngày 31/08/2026.** Lý do: nó
không mang được ý nào của sản phẩm — một con vật dễ thương đứng cạnh app, và mỗi lần
đổi giao diện lại phải vẽ lại bốn biểu cảm.

Nuôi một linh vật tốn: một bộ asset, một người vẽ, một luật về chỗ nào được xuất hiện,
và một cuộc tranh luận mỗi lần thêm màn mới. Nó chỉ đáng khi con vật đó *là* một ý của
sản phẩm. Ở đây thì không.

### 4.1 Bốn chỗ cũ của linh vật, giờ là gì

| Chỗ | Giờ là |
|---|---|
| Màn chào mừng | App icon, trôi lên xuống 8px, hào quang thở lệch nhịp |
| Góc chưa có ai | Khung đứt nét, bên trong là `logo-ghost` — **một vòng đặc và một vòng đứt** |
| Hết khoảnh khắc | Khung đứt nét vuông, đúng độ bo 32 của khung ngắm camera |
| Nút góc trên trái màn camera | Dấu hiệu 28px trong vòng tròn nền `surface` |
| Lúc mở khoá | Chính vòng độ thân sáng lên một nấc + đúng ba hạt confetti |

### 4.2 Được thêm một tầng nghĩa

Một vòng đứt nét cạnh một vòng đặc đọc ra ngay **"còn thiếu một người"** — việc mà một
con vật buồn không làm được. Màn trống giờ nói đúng cái đang thiếu, thay vì chỉ tỏ ra
đáng thương. Bớt một bộ asset, thêm một tầng nghĩa.

Luật cho mọi màn trống: **khung đứt nét + một câu + một nút.** Không bao giờ chỉ có chữ,
và không bao giờ có nhân vật.

---

## 5. Tham khảo Locket — lấy gì, bỏ gì

Locket là app cùng thể loại và đã thắng ở Việt Nam, nên nó là chỗ đáng học. **Học cách
họ làm, không chép cái họ có.**

| Lấy | Vì sao |
|---|---|
| Một màu ấm bão hoà cao, dùng thẳng tay | Đây là thứ khiến người ta nhận ra app từ ngoài màn hình chủ. Bài học chính. |
| Một câu duy nhất nói app làm gì | Locket mở bằng "Best friends first". Người mở app lần đầu chưa quan tâm tên app. |
| Widget là lời chào đầu tiên, không phải tính năng phụ | Ảnh hiện trên màn hình chủ là lý do người ta ở lại. |
| Giới hạn số bạn, không đếm follower | Locket giới hạn 20, Nook 10. Cùng một triết lý: không có gì để so đo. |
| Phản hồi bằng cảm xúc, không đếm lượt thích | Giữ nguyên ở Nook. |

| Bỏ | Vì sao |
|---|---|
| Màu vàng-gold của họ | Đó là chữ ký của Locket. Nook đi hướng lửa đất — cùng họ ấm nhưng nhận ra được là hai app khác nhau. |
| Giao diện sáng | Nook tối mặc định, ảnh nổi lên trên nền tối. |
| Bán tính năng theo gói Gold | Nook không bán chỗ bạn bè, không bán cấp độ — xem `../../.docs/01-product-system.md` mục 7. |
| Linh vật | Nook bỏ hẳn — xem mục 4. Locket cũng không có linh vật, và đó là một phần lý do app họ trông gọn. |

Điểm khác lớn nhất về sản phẩm: Locket dừng ở "gửi ảnh cho nhau". Nook có thêm **ký ức
và cấp độ tình bạn** — thứ chỉ hai người trong cặp nhìn thấy. Đó là lý do tồn tại của
Nook, và cũng là thứ không được đem đi so với Locket bằng giao diện.

---

## 6. Đã đổi gì so với bản đầu

| Đổi | Lý do |
|---|---|
| Màu chủ đạo `#C97B57` → `#F2703A`, thêm dải màu cho nút | Màu cũ chìm: mất hút trên màn hình chủ và cạnh ảnh buổi tối |
| **01/09/2026 — một sắc cam → song sắc `#FF7A3D` → `#FF4E8A`** | Một sắc thì mọi thứ cùng một nhiệt độ; thiếu màu thứ hai cho khoảnh khắc vui. Kéo theo: `honey`/`mint`/`danger` sáng lên, thêm `violet`, thêm `onAccent` |
| Chữ nút chính chốt là `#1A0E08`, không phải trắng | Chữ trắng trên dải chỉ đạt 2,26–2,92:1, trượt chuẩn ở cả ba chặng |
| Viền `#2B2725` → `#332E2A`, thêm `borderSoft` | Cạnh ô nhập và thẻ trước đây gần như không thấy |
| Mật ong và bạc hà sáng lên một nấc | Đứng cạnh màu chủ đạo mới thì bản cũ trông xỉn |
| Vòng độ thân kéo lên tới đúng màu chủ đạo | Cấp 10 phải sáng bằng chính ngọn lửa của app |
| Thang màu chữ nâng một nấc, thêm `textDisabled` | Màu chú thích cũ chỉ đạt 2,6:1 — dưới chuẩn đọc, ra nắng là mất chữ |
| `danger` đổi từ `#B5544A` sang `#D8635A` | Màu cũ 4,1:1, chưa đủ cho chữ nhỏ |
| Thêm `accentBright`, `surfaceRaised`, `glow` | Cần cho hào quang và các lớp nổi; trước đó phải viết hex tay |
| Bỏ linh vật, logo đổi sang "Ôm" | Con chim non không nói gì về app; hai vòng thì đã có sẵn trong wordmark, trong vòng độ thân và trong định nghĩa "ký ức" |
