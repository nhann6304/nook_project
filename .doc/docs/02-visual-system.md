# Nook — Thiết kế tổng quan ứng dụng

Codename: **Nook** (tên thật chốt trước khi lên store — xem mục 9)
Tagline: *Góc nhỏ của tụi mình*
Đi kèm: `circle-design-doc-v0.md` (hệ thống ký ức, cấp độ tình bạn, chống farm, privacy)

Tài liệu này lo phần **nhìn thấy được**: thương hiệu, màn hình, component, chữ nghĩa, chuyển động, thứ tự build.

---

## 1. Nguyên tắc thiết kế thị giác

Bốn câu này quyết định mọi pixel về sau:

1. **Tối và trầm, mặc định.** Nền gần đen ấm, một điểm nhấn đất nung. Không có chế độ sáng ở V0.1 — ảnh nổi lên trên nền tối, và app này hay được mở buổi tối.
2. **Ảnh là ngôi sao, UI lùi lại.** Không viền dày, không bóng đổ, không icon rườm rà quanh ảnh.
3. **Không có gì để so sánh.** Không số like công khai, không bảng xếp hạng, không đếm follower. Mọi con số chỉ hai người trong cặp thấy.
4. **Tròn, mềm, không góc nhọn.** Bo góc lớn ở mọi nơi — vòng bạn bè, thẻ ảnh, nút bấm.

---

## 2. Hệ thống thương hiệu

### Màu

| Vai trò | Hex | Dùng ở đâu |
|---|---|---|
| Nền | `#0E0D0C` | Toàn bộ nền app (đen ấm, không đen tuyệt đối) |
| Bề mặt | `#1A1817` | Thẻ, pill, khung camera, ô nhập |
| Bề mặt chìm | `#141312` | Chỗ trống, ô ngủ đông |
| Viền | `#2B2725` | Đường kẻ 0.5px, viền đứt |
| Đất nung (chính) | `#C97B57` | Nút chụp, nhấn mạnh, wordmark |
| Đất nung đậm | `#A85F3F` | Trạng thái nhấn |
| Chữ chính | `#EFE9E3` | Tên, tiêu đề, nội dung |
| Chữ phụ | `#8A8078` | Nhãn, thời gian, icon phụ |
| Chữ mờ | `#5C5249` | Gợi ý, chữ nền, trạng thái tắt |
| Mật ong trầm | `#B8912F` | Mở khóa, badge cấp độ |
| Bạc hà trầm | `#4E8C79` | Đã mở, đang online, ở gần |

Không dùng đen tuyệt đối `#000000` — nền hơi ấm giúp ảnh không bị "dán" vào nền và đỡ chói viền trên màn OLED.

**Thang độ thân** (vòng quanh avatar, đây là "thanh XP" duy nhất của app), sáng dần trên nền tối:
`#3D3330` → `#5C4638` → `#85604A` → `#AE7355` → `#D08055` (cấp 1 → 10)
Ngủ đông: nền `#141312`, viền đứt `#2B2725`.

Quy tắc: **độ thân được mã hóa bằng độ ấm của màu, không bao giờ bằng con số hiển thị công khai.**

### Kiểu chữ

**Be Vietnam Pro** — miễn phí trên Google Fonts, thiết kế riêng cho tiếng Việt nên dấu không bị vỡ ở cỡ nhỏ. Đây là điểm nhiều app Việt làm hỏng.

| Cấp | Cỡ | Đậm |
|---|---|---|
| Tiêu đề màn hình | 22px | 500 |
| Tiêu đề mục | 17px | 500 |
| Nội dung | 14px | 400 |
| Nhãn phụ, thời gian | 12px | 400 |
| Con số lớn (ký ức, ngày) | 22px | 500 |

Chỉ hai độ đậm: 400 và 500. Không dùng 700 trừ wordmark.

### Logo & linh vật

- **Wordmark**: chữ thường, hai chữ "oo" màu đất nung — hai chữ o chính là hai người trong một góc.
- **App icon**: mái vòm chữ "n" trên nền `#0E0D0C`, Nem nép bên trong. Đọc được ở 60×60px.
- **Nem** xuất hiện đúng bốn chỗ: **nút góc trên trái màn camera** (32px, thay cho logo), **empty state**, **onboarding**, **khoảnh khắc mở khóa**. Hết. Ở kích thước nhỏ chỉ giữ ba chi tiết — thân, hai mắt, mỏ; bỏ cánh, bỏ khăn, bỏ má hồng.
- Không để Nem chen vào feed hay đè lên ảnh. Mascot xuất hiện nhiều sẽ thành trẻ con.

---

## 3. Điều hướng

Không có tab bar. App mở thẳng vào camera như Locket, mọi thứ khác là một cử chỉ:

```
                    CAMERA
        (mở app là thấy, không màn chờ)
                       │
   ┌───────────────────┼───────────────────┐
   │                   │                   │
chạm avatar        vuốt lên          chạm bánh răng
   │                   │                   │
Góc của bạn      Khoảnh khắc          Cài đặt
   │                   │
chạm 1 người      chạm 1 ảnh
   │                   │
Chi tiết          Trò chuyện
tình bạn          (riêng tư)
```

Lý do bỏ tab bar: tab bar chiếm 80px dưới màn hình và ngầm nói "app này có nhiều chỗ để lượn". Nook chỉ có một hành động chính — chụp.

---

## 4. Đặc tả từng màn hình

### 4.1 Camera (mặc định)

Chỉ có **bốn khối**, xếp dọc, cách nhau thoáng. Không có gì khác trên màn hình này.

**1 — Thanh trên** (cao 32px): Nem bên trái · pill "Góc của bạn · 9" ở giữa · bánh răng bên phải. Ba thứ, không hơn.

**2 — Khung ngắm.** Đây là chỗ bản nháp trước làm sai.
- Vuông 1:1, **rộng 88% chiều ngang máy**, bo góc 32px, căn giữa.
- Kích thước tính theo **chiều ngang**, không theo chiều dọc. Máy dài hơn thì phần thừa biến thành khoảng thở trên/dưới, khung ngắm **không giãn ra**.
- Trên iPhone SE và iPhone Pro Max, khung phải trông cùng một tỉ lệ so với bàn tay.
- Pill "Thêm một dòng…" mờ, nổi ở đáy khung — không phải một ô nhập riêng bên dưới.

**3 — Hàng chụp** (cách khung 24px): thư viện · **nút chụp** vòng đất nung 66px viền 3px · đảo camera. Nút chụp là thứ to nhất màn hình, đúng như vậy.

**4 — Chân màn**: mũi tên lên + chữ "Khoảnh khắc" màu mờ `#5C5249`. Một dòng, không giải thích thêm.

Sau khi chụp: ảnh vừa chụp thế chỗ khung ngắm, gõ caption ngay trên pill đó, nút chụp đổi thành nút gửi. **Không có bước chọn người nhận** — đã trong góc thì đều thấy. Đây là thứ làm app nhẹ đầu.

Góc trống: thay khung ngắm bằng Nem-mới-nở + "Góc của bạn đang trống. Mời người đầu tiên."

### 4.2 Khoảnh khắc (feed)

- Nền `#0E0D0C`, cuộn dọc, mỗi khoảnh khắc là một thẻ `#1A1817` bo 20px.
- Đầu thẻ: avatar có vòng độ thân + tên + thời gian tương đối.
- Ảnh vuông bo 16px. Caption dưới ảnh.
- Hàng phản hồi: 3 emoji nhanh + ô "Nhắn riêng cho {tên}…".
- Chỉ hiện 48 giờ gần nhất. Hết feed → "Hết rồi. Chụp gì đó đi." + nút về camera.
- **Không hiện tổng số react. Không comment công khai.** Chạm emoji → gửi riêng cho người đăng, kèm haptic nhẹ.

### 4.3 Trò chuyện

- Mở từ một khoảnh khắc, ảnh gốc **ghim trên đầu** làm ngữ cảnh.
- Bong bóng chat đơn giản: mình = nền đào chữ kem, họ = nền kem chữ cacao.
- Đây là toàn bộ "chat" của V0.1 — không cần inbox riêng, không cần danh sách hội thoại. Mọi cuộc trò chuyện đều neo vào một khoảnh khắc.

### 4.4 Góc của bạn

- Tiêu đề + "9 / 10 chỗ".
- Lưới 4 cột avatar tròn, mỗi avatar có vòng độ thân theo thang màu.
- Chỗ trống: vòng đứt nét. Một ô luôn là nút `+` mời bạn.
- Người ngủ đông: xám, nhãn "ngủ đông".
- Chạm một người → Chi tiết tình bạn.
- Khi đủ điều kiện thêm chỗ: ô trống mới **nở ra** kèm Nem-ăn-mừng.

### 4.5 Chi tiết tình bạn (V0.2)

- Avatar lớn có vòng, "Bạn và Minh", badge cấp độ nền mật ong.
- Hai thẻ số: ký ức chung · số ngày quen.
- Danh sách tính năng: đã mở (bạc hà + dấu tích) / chưa mở (xám + "còn N ký ức").
- Dưới cùng: Album chung, Timeline, và nút tắt chia sẻ vị trí — **luôn để nút tắt ở nơi dễ thấy, không giấu trong cài đặt.**
- Tuyệt đối không hiển thị bảng so sánh giữa các bạn.

### 4.6 Cài đặt

Nhóm theo thứ tự quan trọng, riêng tư lên trước:
1. **Riêng tư & vị trí** — bật/tắt theo từng người, nút "Tắt hết vị trí" to và rõ.
2. Thông báo.
3. Tài khoản — tên, avatar, xóa tài khoản (phải có, Apple bắt buộc).
4. Về Nook.

### 4.7 Onboarding (5 màn, mỗi màn một việc)

1. Nem-trứng + tagline → "Bắt đầu"
2. Đăng nhập SĐT / Apple
3. Tên + ảnh đại diện
4. Mời người đầu tiên (danh bạ / link / QR)
5. Xin quyền camera + thông báo — **giải thích lý do trước khi bật hộp thoại hệ thống**, tỉ lệ đồng ý sẽ cao hơn hẳn

---

## 5. Thư viện component

| Component | Đặc tả |
|---|---|
| Nút chính | Nền `#C97B57`, chữ `#0E0D0C`, bo 24px, cao 48px, chữ 15px/500 |
| Nút phụ | Nền trong suốt, viền 0.5px `#2B2725`, chữ `#EFE9E3` |
| Thẻ | Nền `#1A1817`, không viền, bo 20px, đệm 14–16px |
| Thẻ số | Nền `#1A1817`, bo 12px, nhãn 12px `#8A8078` trên số 22px `#EFE9E3` |
| Pill | Nền `#1A1817`, bo 20px, cao 32px, chữ 13px |
| Avatar + vòng | Tròn, viền 2.5px theo thang độ thân; ngủ đông = viền đứt |
| Badge cấp độ | Nền `#B8912F`, chữ `#0E0D0C`, bo 20px, 12px/500 |
| Ô nhập | Nền `#1A1817`, bo 20px, cao 40px, placeholder `#5C5249` |
| Empty state | Nem + một câu + một nút. Không bao giờ chỉ có chữ. |
| Toast mở khóa | Trượt từ trên, nền mật ong, tự ẩn sau 3s |

Bo góc: 12px (thẻ nhỏ) · 16px (ảnh) · 20px (thẻ lớn) · 24px (nút, khung phone) · 50% (avatar).

---

## 6. Chữ nghĩa (microcopy)

Giọng: **bạn bè nhắn tin, không phải hệ thống thông báo.** Xưng "bạn", không dùng "quý khách", không dùng dấu chấm than.

| Tình huống | Viết thế này | Đừng viết |
|---|---|---|
| Feed trống | "Hết rồi. Chụp gì đó đi." | "Không có bài viết nào." |
| Góc trống | "Góc của bạn đang trống. Mời người đầu tiên." | "Bạn chưa có bạn bè." |
| Gửi xong | "Đã vào góc" | "Đăng thành công!" |
| Lên cấp | "Bạn và Minh vừa mở Album chung." | "Chúc mừng! Bạn đã đạt Level 3!" |
| Ngủ đông | "Lâu rồi chưa có gì mới với Minh." | "Tình bạn của bạn đang giảm!" |
| Hết chỗ | "Góc đã đầy. Thân hơn với người đang có sẽ mở thêm chỗ." | "Nâng cấp để thêm bạn." |
| Lỗi mạng | "Chưa gửi được. Thử lại nhé." | "Error 500." |

Ba từ cấm trong toàn app: **điểm, hạng, nhiệm vụ.** Thay bằng: ký ức, cấp độ, hành trình.

---

## 7. Chuyển động

Ít nhưng đúng chỗ. Mọi chuyển động dùng ease-out, 200–300ms.

- **Nút chụp**: thu nhỏ 0.92 khi nhấn + haptic medium. Đây là khoảnh khắc quan trọng nhất app — phải sướng tay.
- **Ảnh gửi đi**: bay lên và nhỏ dần về phía avatar góc trên.
- **Vòng lên cấp**: màu chuyển dần 600ms, kèm haptic success.
- **Mở khóa tính năng**: Nem trượt vào, toast mật ong, 3 hạt confetti (chỉ 3 — nhiều hơn là rẻ tiền).
- **Chỗ mới trong góc**: vòng đứt nét nở ra từ 0.8 → 1.

Không dùng: loading spinner (dùng skeleton kem), bounce, hiệu ứng đàn hồi quá đà.

---

## 8. Thứ tự build cho một người

Làm xong hẳn từng cái rồi mới sang cái tiếp — đúng tinh thần polish từng màn hình.

| Tuần | Việc | Xong nghĩa là |
|---|---|---|
| 1 | Design system trong code: màu, font, 8 component cơ bản | Có sẵn "gạch" để xây mọi màn sau |
| 2 | Auth + Onboarding 5 màn | Tạo được tài khoản thật |
| 3 | Camera + chụp + gửi | Ảnh lên được server |
| 4 | Góc của bạn + mời bạn + kết bạn | Hai máy thật kết nối được |
| 5 | Feed + react | Thấy ảnh của nhau |
| 6 | Trò chuyện quanh khoảnh khắc | V0.1 hoàn chỉnh |
| 7 | Đánh bóng: haptic, animation, empty state | Đủ đẹp để đưa bạn bè dùng |
| 8–9 | **Test với nhóm bạn thật, không thêm tính năng nào** | Có số liệu để quyết định V0.2 |

Bảng `events` phải chạy ngầm **ngay từ tuần 3** — dù chưa ai nhìn thấy. Không có nó thì Timeline sau này mất sạch lịch sử.

Widget màn hình chính: nếu tuần 7 chưa đủ đẹp thì đẩy sang V0.2. Ship widget xấu còn hại hơn không có widget.

---

## 9. Checklist trước khi lên store

**Tên** — Nook hiện đã có ít nhất 3 app xã hội trùng tên trên store, cộng thêm Barnes & Noble NOOK đăng ký cho phần mềm. Dùng Nook làm codename khi build, nhưng trước launch phải:
- [ ] Tra App Store + Google Play bằng tên định chọn
- [ ] Tra nhãn hiệu tại Cục Sở hữu trí tuệ Việt Nam (nhóm 9 và 42)
- [ ] Kiểm tra domain `.com` và handle Instagram / TikTok
- [ ] Ưu tiên tên tự đặt (coined) — dễ giành trademark và lên top tìm kiếm hơn hẳn từ có sẵn

**Linh vật**
- [ ] Nem không có lông mày đen chữ V (tránh Angry Birds)
- [ ] Nem không phải gấu mèo / lửng chó (tránh Tom Nook — Nintendo)
- [ ] Không dùng silhouette chim nghiêng đơn sắc (tránh Twitter cũ)

**Bắt buộc để duyệt App Store**
- [ ] Chức năng xóa tài khoản trong app
- [ ] Chính sách riêng tư có URL công khai
- [ ] Giải thích rõ lý do xin quyền camera / vị trí trong `Info.plist`
- [ ] Cơ chế báo cáo & chặn người dùng (app xã hội bắt buộc phải có)
- [ ] Ghi rõ độ tuổi tối thiểu và kiểm tra tuổi khi đăng ký
