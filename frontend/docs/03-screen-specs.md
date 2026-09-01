# Nook — Đặc tả 18 màn hình

Nguồn tham chiếu khi implement từng màn bằng React Native.
Màu, chữ, logo, linh vật: [`01-brand.md`](01-brand.md).
Component, điều hướng, chuyển động, chữ nghĩa: [`02-ui-system.md`](02-ui-system.md).
Widget không phải một màn — xem [`04-widget.md`](04-widget.md).

Màn nào đã code thì ghi tên file ngay cạnh tiêu đề.

Quy ước chung mọi màn hình: nền `#0E0D0C`, không tab bar, điều hướng bằng cử chỉ
(chạm avatar, vuốt lên, chạm bánh răng). Chữ tiếng Việt, giọng bạn bè.

---

## Nhóm A — Onboarding (6 màn)

### 1. Chào mừng  — `screens/WelcomeScreen.tsx`
**Màn đầu tiên người dùng thấy khi mở app lần đầu.** Đây là chỗ duy nhất trong app có
cả app icon lẫn chữ "nook" — vào rồi thì app không tự giới thiệu nữa.

Căn giữa, ba khối:

**1 — Dấu hiệu nhận diện.** App icon thật (hai vòng "Ôm", bo 24, cỡ 88) đặt giữa hào quang
240px gồm ba vòng lồng nhau. Đây là chỗ duy nhất trên màn có chuyển động:

| Thứ | Chuyển động |
|---|---|
| App icon | Trôi lên xuống 8px, 1,7s một chiều, ease-in-out, lặp mãi |
| Hai vòng hào quang trong | Độ đục 0,55 ⇄ 1 và cỡ 0,94 ⇄ 1,08, lệch nhịp với icon (1,5s) |
| Vòng ngoài cùng | Đứng yên — có ba thứ cùng động là rối |

Máy bật "giảm chuyển động" thì **tắt hết, không hỏi lại**, không có công tắc riêng
trong app.

**2 — Chữ.** Wordmark "nook" 24px/700 (nhỏ), ngay dưới là câu chính **30px/500, hai
dòng, căn giữa**:

> Ảnh trực tiếp
> từ góc nhỏ của mình

Câu này to hơn wordmark là cố ý: người mở app lần đầu chưa quan tâm app tên gì, họ cần
biết nó làm gì. Wordmark chỉ để họ chắc mình cài đúng app.

**3 — Hai cửa vào.** Nút chính **"Tạo tài khoản"** (dải màu ấm + bóng cùng màu) và nút
phụ **"Tôi đã có tài khoản"** (viền). Dưới cùng, chữ nhỏ: "Chỉ 10 người trong góc.
Không ai xếp hạng ai."

Hai nút dẫn về **cùng một màn Đăng nhập**, chỉ khác `mode`. Người dùng cần thấy đường
của mình ngay từ màn đầu, dù bên dưới là một luồng.

### 2. Đăng nhập  — `screens/SignInScreen.tsx`
Nhận một `mode`: `signup` (vào từ nút "Tạo tài khoản") hoặc `signin` (vào từ nút
"Tôi đã có tài khoản"). Chỉ đổi tiêu đề và câu mô tả, không đổi thao tác:

| `mode` | Tiêu đề | Mô tả |
|---|---|---|
| `signup` | Tạo tài khoản | "Nook gửi bạn một mã 6 số. Không mật khẩu, không có gì để nhớ." |
| `signin` | Đăng nhập | "Nhập lại email hoặc số bạn đã dùng, Nook gửi mã mới." |

Mũi tên quay lại ở góc trên trái. Dưới đó, căn trái toàn màn:

- **Dấu hiệu hai vòng** 38px trong vòng tròn `surface` 64px, đặt giữa một **hào quang**
  120px (ba vòng lồng nhau). Đây là điểm sáng duy nhất của màn.
- Tiêu đề và mô tả theo `mode` ở bảng trên.
- **Thanh chuyển hai chế độ**: `Email` | `Số điện thoại`. Rãnh nền `surfaceSunken`,
  ô đang chọn nền `surface` chữ sáng. Đổi chế độ có rung nhẹ.
- **Một ô nhập duy nhất**, cao 52, bo 20, viền `border` — viền đổi sang đất nung khi
  đang gõ, sang đỏ khi lỗi. Chế độ số điện thoại có khối `+84` cố định bên trái, ngăn
  bằng một vạch dọc; số tự tách nhóm ba khi gõ.
- **Dòng phụ luôn chiếm chỗ** dưới ô nhập ("Mã sẽ tới hộp thư này trong khoảng một
  phút."). Có lỗi thì cùng chỗ đó đổi thành chữ đỏ — layout không nhảy.
- Nút chính **"Gửi mã"**, mờ đi khi chưa nhập đủ, thành vòng chờ khi đang gửi.
  Nút nằm **ngay dưới ô nhập**, không ghim đáy màn: bàn phím trên máy thấp sẽ nuốt mất.
- **Ô điều khoản** — chỉ ở `mode = signup`. Ngay dưới nút chính, một ô nền `surfaceSunken`
  bo 16, viền `borderSoft`, chữ 12px: "Chạm *Gửi mã* nghĩa là bạn đồng ý với **Điều khoản
  dịch vụ** và **Chính sách riêng tư** của Nook." Hai cụm in đậm là link, hiện chưa trỏ
  đi đâu — **chỗ giữ sẵn, nội dung viết sau**. Ô phải có từ bây giờ vì thêm muộn là phải
  sắp lại cả màn.
  Ở `mode = signin` không có ô này: người đã có tài khoản thì đồng ý rồi.

Hai chế độ giữ giá trị riêng — gõ email, đổi sang số rồi quay lại thì email vẫn còn.

Sau khi mã đúng: người mới đi tiếp sang màn 4 (Tên và ảnh), người cũ vào thẳng camera.
Việc phân biệt mới/cũ là của backend, màn hình chỉ nhận kết quả.

### 3. Nhập mã  — `screens/VerifyCodeScreen.tsx`
Mũi tên quay lại (quay về màn 2 để sửa email/số). Tiêu đề "Nhập mã" + "Mã 6 số vừa
gửi tới hộp thư **ten@gmail.com**" (đích đến in đậm bằng màu chữ chính — người gõ
nhầm một chữ phải thấy được ngay ở đây).

- **Sáu ô mã** dàn đều hết chiều ngang, bo 16, nền `surfaceSunken`; ô đã có số đổi nền
  `surface`, ô đang tới lượt viền đất nung. Số cỡ 22.
- Bên dưới sáu ô là **một ô nhập thật, trong suốt, phủ lên trên** — nhờ vậy mã từ tin
  nhắn / hộp thư tự điền được, dán mã không vỡ, xoá lùi không nhảy ô.
- **Đủ 6 số là tự kiểm, không có nút xác nhận.** Đang kiểm hiện "Đang kiểm tra…".
- Mã sai: sáu ô rung ngang, viền đỏ, **xoá sạch** rồi để con trỏ ở ô đầu, chữ đỏ
  "Mã không đúng. Thử lại nhé." Không bắt người dùng tự xoá.
- Dưới nữa: "Gửi lại mã sau 0:45" (đếm ngược 60 giây, chữ mờ) → hết giờ thành nút
  "Gửi lại mã" màu đất nung. Cạnh đó: "Dùng email khác" / "Dùng số khác".
- Cuối màn, chữ nhỏ: "Không thấy mã? Ngó thử mục quảng cáo hoặc thư rác trong hộp thư
  của bạn."

**Chốt lại so với bản trước:** V0.1 đăng nhập bằng **email hoặc số điện thoại + mã 6
số**, không có Apple/Google. Vì chỉ có đăng nhập của chính Nook (không mượn nhà cung
cấp thứ ba), App Store **không** bắt buộc phải có "Sign in with Apple".

### 4. Tên và ảnh
Tiêu đề "Bạn tên gì?" + "Bạn bè trong góc sẽ thấy tên và ảnh này." Ở giữa: vòng tròn
avatar placeholder viền đứt với icon camera, có nút tròn nhỏ dấu `+` màu đất nung
ở góc dưới phải để thêm ảnh. Bên dưới: ô nhập tên. Nút "Tiếp tục" ở đáy.

### 5. Mời người đầu tiên
Tiêu đề "Mời người đầu tiên" + "Nook chỉ vui khi có bạn bè. Bắt đầu với một hai người
thân nhất là đủ." Ba dòng lựa chọn dạng hàng (row), mỗi hàng có icon + tiêu đề + mô tả
phụ + mũi tên phải: **Gửi link mời** (qua Zalo/Messenger/tin nhắn), **Quét mã QR**
(khi ngồi cạnh nhau), **Tìm trong danh bạ** (ai đã dùng Nook rồi). Cuối màn hình có
link nhỏ "Để sau" — không bắt buộc phải mời ngay.

### 6. Xin quyền
Tiêu đề "Hai quyền cuối" + "Nook chỉ xin đúng những gì cần để chạy." Hai hàng giải
thích rõ **trước khi** bật hộp thoại hệ thống: Camera ("Để chụp khoảnh khắc gửi vào
góc. Ảnh chỉ đi tới bạn bè của bạn.") và Thông báo ("Để biết khi bạn bè đăng gì mới.
Nook không gửi quảng cáo."). Nút chính "Cho phép" + dòng nhỏ "Đổi lại bất cứ lúc nào
trong Cài đặt."

---

## Nhóm B — Vòng lặp hàng ngày (4 màn)

### 7. Camera (màn mặc định khi mở app)
Bốn khối xếp dọc, `justifyContent: space-between`:
1. **Thanh trên**: dấu hiệu hai vòng (28px, trong vòng tròn nền surface 36px) bên trái · pill
   "Góc của bạn · {số}" ở giữa · icon bánh răng bên phải.
2. **Khung ngắm**: hình vuông, rộng = **88% chiều ngang máy** (không phải chiều dọc),
   bo góc 32px, nền surface. Camera preview lấp đầy. Nổi ở đáy khung một pill mờ
   "Thêm một dòng…" (placeholder cho caption, chưa gõ).
3. **Hàng chụp**: icon thư viện (trái) · nút chụp — vòng tròn 66px viền 3px màu
   đất nung, bên trong là khối tròn 52px đặc màu đất nung (giữa) · icon đảo camera
   (phải).
4. **Chân màn**: mũi tên hướng lên + chữ "Khoảnh khắc" màu mờ.

**Chưa cho quyền camera:** màn này thay bằng lời giải thích + nút xin quyền. Nếu
người dùng đã từ chối một lần thì hệ thống **không hỏi lại nữa** — lúc đó phải đổi
chữ ("Camera đang tắt") và đổi nút thành *Mở Cài đặt máy*, đồng thời nghe `AppState`
để tự đọc lại quyền khi họ quay về. Luôn chừa một lối đi tiếp (xem Khoảnh khắc), vì
Camera là màn mặc định — kẹt ở đây là kẹt cả app.

### 8. Vừa chụp xong
**Không chuyển màn.** Ảnh vừa chụp đè lên chính khung ngắm, `CameraView` vẫn nằm
nguyên bên dưới — tháo camera ra rồi lắp lại tốn 300–500ms nhìn thấy được bằng mắt
trên máy tầm trung. Thay khối camera bằng ảnh vừa chụp. Thanh trên đổi: icon `x` (huỷ, trái) · pill xám
"Gửi cho {n} người trong góc" (**chỉ để thông tin, không bấm được** — không có bước
chọn người nhận) · khoảng trống (phải). Trong khung ảnh, pill caption giờ có con trỏ
nhấp nháy, đang gõ được. Hàng dưới: icon tải xuống (trái) · **nút gửi** — vòng tròn
đặc màu đất nung với icon mũi tên lên (giữa, thay cho nút chụp) · icon emoji nhanh
(phải).

### 9. Khoảnh khắc (feed)
Tiêu đề "Khoảnh khắc" ở trên, mũi tên xuống bên trái để đóng. Danh sách thẻ cuộn dọc,
mỗi thẻ nền surface bo 20px gồm: hàng đầu (avatar có vòng độ thân + tên + "X phút
trước"), ảnh vuông bo 16px, caption, và hàng phản hồi (3 pill emoji nhanh + một ô dài
"Nhắn riêng cho {tên}…"). **Không có số lượt thích hiển thị, không có bình luận công
khai.** Dòng chú thích cuối feed: "Chỉ hiện 48 giờ gần nhất."

Feed rỗng: khung đứt nét vuông 208px (đúng độ bo 32 của khung ngắm camera) + "Hết rồi.
Chụp gì đó đi." + nút phụ "Mở camera".

### 10. Trò chuyện
Mở ra từ một khoảnh khắc cụ thể. Thanh trên: mũi tên trái (quay lại) · avatar nhỏ +
tên người đang chat · khoảng trống. Ngay dưới thanh trên là **thẻ ảnh gốc được ghim**
(thumbnail nhỏ + caption) làm ngữ cảnh cuộc trò chuyện. Bên dưới là bong bóng chat:
tin của người kia căn trái nền surface chữ sáng, tin của mình căn phải nền đất nung
chữ tối. Ô nhập ở đáy dạng pill với nút gửi hình mũi tên tròn.

---

## Nhóm C — Bạn bè (4 màn)

### 11. Góc trống (trạng thái mới cài app, chưa có bạn)
Căn giữa toàn màn hình: **khung đứt nét 156px**, bên trong là `logo-ghost` — một vòng
đặc (bạn) và một vòng đứt nét (người chưa mời). Chữ "Góc của bạn đang trống. Mời người
đầu tiên vào nhé." Nút chính "Mời bạn" bên dưới.

Vòng đứt nét ở đây không phải trang trí: nó nói đúng cái đang thiếu.

### 12. Góc của bạn (đã có bạn bè)
Thanh trên: mũi tên trái · tiêu đề "Góc của bạn" · "9 / 10" bên phải. Lưới 4 cột,
mỗi ô là avatar tròn viền màu theo thang độ thân (đậm = thân hơn) + tên nhỏ bên dưới.
Người ngủ đông: viền đứt nét, tên màu mờ. Một ô cuối là dấu `+` viền đứt để mời thêm.
Bên dưới lưới, một thẻ gợi ý: "Góc đã gần đầy. Thân hơn với người đang có sẽ mở thêm
chỗ. {Tên} đang ngủ đông — lâu rồi chưa có gì mới."

### 13. Thêm bạn
Thanh trên: mũi tên trái · "Thêm bạn". Giữa màn hình: mã QR lớn (nền sáng, icon QR
tối) để người khác quét. Chú thích "Đưa bạn bè quét khi ngồi cạnh nhau". Bên dưới:
ba hàng lựa chọn — Quét mã của bạn bè, Gửi link mời, Tìm trong danh bạ.

### 14. Chi tiết tình bạn (V0.2)
Thanh trên: mũi tên trái · khoảng trống · icon ba chấm (tuỳ chọn thêm). Giữa: avatar
lớn viền màu độ thân, "Bạn và {tên}", badge nền mật ong "Cấp {n} · {tên cấp}". Hai
thẻ số cạnh nhau: "Ký ức chung: {n}" và "Quen nhau: {n} ngày". Danh sách tính năng
theo hàng dọc, mỗi hàng có icon + tên + trạng thái (dấu tích bạc hà nếu đã mở, hoặc
"còn N ký ức" màu mờ nếu chưa): Album chung, Địa điểm kỷ niệm, Ở gần đây, Dòng thời
gian. **Cấp độ và số liệu này chỉ hai người trong cặp nhìn thấy — không public.**

---

## Nhóm D — Cài đặt (4 màn)

### 15. Cài đặt (màn chính)
Thanh trên: mũi tên trái · "Cài đặt". Hàng hồ sơ (avatar + tên + "N người trong góc"
+ mũi tên phải). Nhóm "Riêng tư": Vị trí (mô tả "Đang bật với N người"), Chặn và báo
cáo. Nhóm "Ứng dụng": Thông báo, Tài khoản, Về Nook. **Riêng tư luôn đứng nhóm đầu
tiên, không giấu ở cuối.**

### 16. Vị trí
Thanh trên: mũi tên trái · "Vị trí". **Hàng đầu tiên, nổi bật nhất**: công tắc "Tắt
hết vị trí" — "Không ai thấy bạn ở đâu, ngay lập tức". Nhóm "Bật riêng với từng
người": mỗi bạn một hàng avatar + tên + trạng thái ("Ở gần đây · cấp 6" hoặc "Chưa
mở · cấp 5") + công tắc riêng. Thẻ giải thích cuối màn: "Nook chỉ lưu vị trí hiện
tại trong 15 phút và không giữ lịch sử. Cả hai phải cùng bật thì mới thấy nhau."

### 17. Thông báo
Danh sách công tắc: Khoảnh khắc mới, Tin nhắn, Mở khóa mới, Lời mời kết bạn — tất cả
mặc định bật. Thẻ cuối màn: "Nook không gửi thông báo quảng cáo và không nhắc bạn
quay lại app."

### 18. Tài khoản
Avatar lớn giữa màn hình với nút bút chì nhỏ để sửa. Hàng "Tên" và "Đăng nhập bằng"
(hiển thị email hoặc số điện thoại đã dùng, không sửa được ở V0.1). Nhóm "Dữ liệu": "Tải về khoảnh khắc của
bạn" (xuất dữ liệu — không bắt buộc theo Apple nhưng tăng niềm tin). Nhóm cuối:
"Đăng xuất" và "Xóa tài khoản" (chữ màu đỏ `danger`, mô tả "Xóa vĩnh viễn mọi
khoảnh khắc và ký ức"). **Bắt buộc phải có để qua duyệt App Store.**

---

## Việc cần làm khi implement

- [ ] Màn 1–6 (Nhóm A): stack điều hướng riêng, chỉ chạy một lần.
      Màn 1–3 (Chào mừng, Đăng nhập, Nhập mã) **đã code xong giao diện**, chưa nối backend.
      Còn màn 4 (Tên và ảnh), 5 (Mời người đầu tiên), 6 (Xin quyền)
- [ ] Màn 7–10 (Nhóm B): màn 7 (Camera), 8 (Vừa chụp xong), 9 (Khoảnh khắc) **đã code xong**.
      Còn **màn 10 (Trò chuyện)** — ô "Nhắn riêng cho…" trong feed đang trỏ tới hư không
- [ ] Màn 11–14 (Nhóm C): màn 11 (Góc) **đã code xong**. Màn 12–13 thuộc V0.1,
      màn 14 (Chi tiết tình bạn) hoãn sang V0.2
- [ ] Màn 15–18 (Nhóm D): màn 15 (Cài đặt) mới có **hàng Ngôn ngữ**. Ưu tiên tiếp
      màn 16 (Vị trí) và 18 (Tài khoản) vì liên quan trực tiếp đến việc qua duyệt App Store

Hai nút trong đặc tả **chưa vẽ ra màn** vì chưa nối được: "Mở thư viện ảnh"
(cần `expo-image-picker`) và "Lưu về máy" (cần `expo-media-library`). Chỗ của
chúng đã chừa sẵn trong `CameraScreen` — vẽ một nút bấm không ăn thì tệ hơn là
chưa vẽ.

Chưa thiết kế (cố ý hoãn, xem lý do trong `../../.docs/01-product-system.md` mục 8 Roadmap):
Album chung, Dòng thời gian, Nearby/WhereAreYou, Shared Places — tất cả thuộc V0.2–V0.3.
