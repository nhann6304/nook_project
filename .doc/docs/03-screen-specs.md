# Nook — Đặc tả 17 màn hình (từ mockup đã duyệt)

Đây là mô tả bằng chữ của các mockup đã thiết kế và được duyệt trong phiên làm việc trước.
Dùng file này làm nguồn tham chiếu khi implement từng màn hình bằng React Native.
Style & token: xem `02-visual-system.md` và `../theme/tokens.ts`.

Quy ước chung mọi màn hình: nền `#0E0D0C`, không tab bar, điều hướng bằng cử chỉ
(chạm avatar, vuốt lên, chạm bánh răng). Chữ tiếng Việt, giọng bạn bè — xem mục
"Chữ nghĩa" trong `02-visual-system.md`.

---

## Nhóm A — Onboarding (5 màn)

### 1. Chào mừng
Căn giữa toàn màn hình. Linh vật Nem (trứng/chim nhỏ) ở trên, wordmark "nook" cỡ lớn
bên dưới (chữ "oo" màu đất nung `#C97B57`, còn lại màu chữ chính), tagline "Góc nhỏ
của tụi mình". Một nút chính "Bắt đầu" ở đáy màn hình.

### 2. Đăng nhập
Tiêu đề "Đăng nhập" + mô tả "Một chạm là xong. Nook không hỏi số điện thoại của bạn."
Hai nút: "Tiếp tục với Apple" (nút nền sáng, icon Apple) và "Tiếp tục với Google"
(nút viền, icon Google). Dòng chữ nhỏ cuối màn hình về Điều khoản & Chính sách riêng tư.
**Không có ô nhập số điện thoại hay OTP ở V0.1.**

### 3. Tên và ảnh
Tiêu đề "Bạn tên gì?" + "Bạn bè trong góc sẽ thấy tên và ảnh này." Ở giữa: vòng tròn
avatar placeholder viền đứt với icon camera, có nút tròn nhỏ dấu `+` màu đất nung
ở góc dưới phải để thêm ảnh. Bên dưới: ô nhập tên. Nút "Tiếp tục" ở đáy.

### 4. Mời người đầu tiên
Tiêu đề "Mời người đầu tiên" + "Nook chỉ vui khi có bạn bè. Bắt đầu với một hai người
thân nhất là đủ." Ba dòng lựa chọn dạng hàng (row), mỗi hàng có icon + tiêu đề + mô tả
phụ + mũi tên phải: **Gửi link mời** (qua Zalo/Messenger/tin nhắn), **Quét mã QR**
(khi ngồi cạnh nhau), **Tìm trong danh bạ** (ai đã dùng Nook rồi). Cuối màn hình có
link nhỏ "Để sau" — không bắt buộc phải mời ngay.

### 5. Xin quyền
Tiêu đề "Hai quyền cuối" + "Nook chỉ xin đúng những gì cần để chạy." Hai hàng giải
thích rõ **trước khi** bật hộp thoại hệ thống: Camera ("Để chụp khoảnh khắc gửi vào
góc. Ảnh chỉ đi tới bạn bè của bạn.") và Thông báo ("Để biết khi bạn bè đăng gì mới.
Nook không gửi quảng cáo."). Nút chính "Cho phép" + dòng nhỏ "Đổi lại bất cứ lúc nào
trong Cài đặt."

---

## Nhóm B — Vòng lặp hàng ngày (4 màn)

### 6. Camera (màn mặc định khi mở app)
Bốn khối xếp dọc, `justifyContent: space-between`:
1. **Thanh trên**: Nem nhỏ (32px, trong vòng tròn nền surface) bên trái · pill
   "Góc của bạn · {số}" ở giữa · icon bánh răng bên phải.
2. **Khung ngắm**: hình vuông, rộng = **88% chiều ngang máy** (không phải chiều dọc),
   bo góc 32px, nền surface. Camera preview lấp đầy. Nổi ở đáy khung một pill mờ
   "Thêm một dòng…" (placeholder cho caption, chưa gõ).
3. **Hàng chụp**: icon thư viện (trái) · nút chụp — vòng tròn 66px viền 3px màu
   đất nung, bên trong là khối tròn 52px đặc màu đất nung (giữa) · icon đảo camera
   (phải).
4. **Chân màn**: mũi tên hướng lên + chữ "Khoảnh khắc" màu mờ.

### 7. Vừa chụp xong
Thay khối camera bằng ảnh vừa chụp. Thanh trên đổi: icon `x` (huỷ, trái) · pill xám
"Gửi cho {n} người trong góc" (**chỉ để thông tin, không bấm được** — không có bước
chọn người nhận) · khoảng trống (phải). Trong khung ảnh, pill caption giờ có con trỏ
nhấp nháy, đang gõ được. Hàng dưới: icon tải xuống (trái) · **nút gửi** — vòng tròn
đặc màu đất nung với icon mũi tên lên (giữa, thay cho nút chụp) · icon emoji nhanh
(phải).

### 8. Khoảnh khắc (feed)
Tiêu đề "Khoảnh khắc" ở trên, mũi tên xuống bên trái để đóng. Danh sách thẻ cuộn dọc,
mỗi thẻ nền surface bo 20px gồm: hàng đầu (avatar có vòng độ thân + tên + "X phút
trước"), ảnh vuông bo 16px, caption, và hàng phản hồi (3 pill emoji nhanh + một ô dài
"Nhắn riêng cho {tên}…"). **Không có số lượt thích hiển thị, không có bình luận công
khai.** Dòng chú thích cuối feed: "Chỉ hiện 48 giờ gần nhất."

### 9. Trò chuyện
Mở ra từ một khoảnh khắc cụ thể. Thanh trên: mũi tên trái (quay lại) · avatar nhỏ +
tên người đang chat · khoảng trống. Ngay dưới thanh trên là **thẻ ảnh gốc được ghim**
(thumbnail nhỏ + caption) làm ngữ cảnh cuộc trò chuyện. Bên dưới là bong bóng chat:
tin của người kia căn trái nền surface chữ sáng, tin của mình căn phải nền đất nung
chữ tối. Ô nhập ở đáy dạng pill với nút gửi hình mũi tên tròn.

---

## Nhóm C — Bạn bè (4 màn)

### 10. Góc trống (trạng thái mới cài app, chưa có bạn)
Căn giữa toàn màn hình. Nem (phiên bản buồn nhẹ, có ba vệt sóng phía dưới gợi ý
"trống trải"). Chữ "Góc của bạn đang trống. Mời người đầu tiên vào nhé." Nút chính
"Mời bạn" bên dưới.

### 11. Góc của bạn (đã có bạn bè)
Thanh trên: mũi tên trái · tiêu đề "Góc của bạn" · "9 / 10" bên phải. Lưới 4 cột,
mỗi ô là avatar tròn viền màu theo thang độ thân (đậm = thân hơn) + tên nhỏ bên dưới.
Người ngủ đông: viền đứt nét, tên màu mờ. Một ô cuối là dấu `+` viền đứt để mời thêm.
Bên dưới lưới, một thẻ gợi ý: "Góc đã gần đầy. Thân hơn với người đang có sẽ mở thêm
chỗ. {Tên} đang ngủ đông — lâu rồi chưa có gì mới."

### 12. Thêm bạn
Thanh trên: mũi tên trái · "Thêm bạn". Giữa màn hình: mã QR lớn (nền sáng, icon QR
tối) để người khác quét. Chú thích "Đưa bạn bè quét khi ngồi cạnh nhau". Bên dưới:
ba hàng lựa chọn — Quét mã của bạn bè, Gửi link mời, Tìm trong danh bạ.

### 13. Chi tiết tình bạn (V0.2)
Thanh trên: mũi tên trái · khoảng trống · icon ba chấm (tuỳ chọn thêm). Giữa: avatar
lớn viền màu độ thân, "Bạn và {tên}", badge nền mật ong "Cấp {n} · {tên cấp}". Hai
thẻ số cạnh nhau: "Ký ức chung: {n}" và "Quen nhau: {n} ngày". Danh sách tính năng
theo hàng dọc, mỗi hàng có icon + tên + trạng thái (dấu tích bạc hà nếu đã mở, hoặc
"còn N ký ức" màu mờ nếu chưa): Album chung, Địa điểm kỷ niệm, Ở gần đây, Dòng thời
gian. **Cấp độ và số liệu này chỉ hai người trong cặp nhìn thấy — không public.**

---

## Nhóm D — Cài đặt (4 màn)

### 14. Cài đặt (màn chính)
Thanh trên: mũi tên trái · "Cài đặt". Hàng hồ sơ (avatar + tên + "N người trong góc"
+ mũi tên phải). Nhóm "Riêng tư": Vị trí (mô tả "Đang bật với N người"), Chặn và báo
cáo. Nhóm "Ứng dụng": Thông báo, Tài khoản, Về Nook. **Riêng tư luôn đứng nhóm đầu
tiên, không giấu ở cuối.**

### 15. Vị trí
Thanh trên: mũi tên trái · "Vị trí". **Hàng đầu tiên, nổi bật nhất**: công tắc "Tắt
hết vị trí" — "Không ai thấy bạn ở đâu, ngay lập tức". Nhóm "Bật riêng với từng
người": mỗi bạn một hàng avatar + tên + trạng thái ("Ở gần đây · cấp 6" hoặc "Chưa
mở · cấp 5") + công tắc riêng. Thẻ giải thích cuối màn: "Nook chỉ lưu vị trí hiện
tại trong 15 phút và không giữ lịch sử. Cả hai phải cùng bật thì mới thấy nhau."

### 16. Thông báo
Danh sách công tắc: Khoảnh khắc mới, Tin nhắn, Mở khóa mới, Lời mời kết bạn — tất cả
mặc định bật. Thẻ cuối màn: "Nook không gửi thông báo quảng cáo và không nhắc bạn
quay lại app."

### 17. Tài khoản
Avatar lớn giữa màn hình với nút bút chì nhỏ để sửa. Hàng "Tên" và "Đăng nhập bằng"
(hiển thị Apple/Google, không sửa được). Nhóm "Dữ liệu": "Tải về khoảnh khắc của
bạn" (xuất dữ liệu — không bắt buộc theo Apple nhưng tăng niềm tin). Nhóm cuối:
"Đăng xuất" và "Xóa tài khoản" (chữ màu đỏ `#B5544A`, mô tả "Xóa vĩnh viễn mọi
khoảnh khắc và ký ức"). **Bắt buộc phải có để qua duyệt App Store.**

---

## Việc cần làm khi implement

- [ ] Màn 1–5 (Nhóm A): stack điều hướng riêng, chỉ chạy một lần
- [ ] Màn 6–9 (Nhóm B): đã có `CameraScreen.tsx` khởi động sẵn — làm tiếp Feed, Thread
- [ ] Màn 10–13 (Nhóm C): màn 10–12 thuộc V0.1, màn 13 (Chi tiết tình bạn) hoãn sang V0.2
- [ ] Màn 14–17 (Nhóm D): toàn bộ thuộc V0.1, ưu tiên màn 15 (Vị trí) và 17 (Tài khoản)
  vì liên quan trực tiếp đến việc qua duyệt App Store

Chưa thiết kế (cố ý hoãn, xem lý do trong `01-product-system.md` mục 8 Roadmap):
Album chung, Dòng thời gian, Nearby/WhereAreYou, Shared Places — tất cả thuộc V0.2–V0.3.
