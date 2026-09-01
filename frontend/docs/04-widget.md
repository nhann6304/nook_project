# Nook — Widget màn hình chính

**Làm được, nhưng không làm bằng React Native.** Widget là code riêng của từng hệ điều
hành: iOS viết bằng SwiftUI (WidgetKit), Android viết bằng XML + RemoteViews. App RN
chỉ có việc **đặt sẵn ảnh và chữ vào một chỗ mà widget đọc được**.

Vì sao đáng làm sớm: đây là cơ chế lan truyền mạnh nhất của Locket. Mời một người bạn
xong là mặt họ hiện ngay trên màn hình chủ — phần thưởng tức thì, không cần mở app.
Nó giải trực tiếp bài toán khó nhất của Nook là góc trống ngày đầu.

---

## 1. Widget hiển thị gì

Một thứ duy nhất: **khoảnh khắc mới nhất trong góc của bạn.** Không danh sách, không
nút, không đếm số.

### Cỡ nhỏ (2×2 — iOS small, Android 2×2)

Ảnh tràn viền, bo góc theo hệ điều hành. Dưới đáy phủ một lớp tối dần (`scrim`, đen ấm
60% → trong suốt, cao 40% ảnh) rồi đặt lên đó:

- Tên người gửi — 13px/500, chữ chính
- Thời gian tương đối — 11px/400, chữ mờ, cùng dòng, sau một dấu chấm giữa

Không avatar, không caption, không logo. Ảnh của bạn mình đã là đủ.

### Cỡ vừa (4×2 — iOS medium, Android 4×2)

Chia hai: ảnh vuông bên trái (bằng chiều cao widget), phần chữ bên phải:

- Avatar 28px có vòng độ thân + tên — một hàng
- Caption, tối đa 2 dòng, 14px/400
- Thời gian, 11px, chữ mờ
- Dưới cùng: ba avatar chồng nhau của những người vừa đăng trong 24 giờ + "và 2 người nữa"

### Trạng thái trống

Nền `surfaceSunken`, khung đứt nét 58px ở giữa với `logo-ghost` bên trong, dưới là
"Chưa có gì mới" (13px, chữ mờ). Cùng một hình với màn trống trong app.
Chạm vào mở thẳng camera. Đây là trạng thái mặc định của người vừa cài app — nó phải
trông có chủ ý, không phải trông như widget hỏng.

### Chưa đăng nhập

Dấu hiệu hai vòng 46px + "Mở Nook để bắt đầu". Chạm vào mở app.

---

## 2. Chạm vào thì đi đâu

| Trạng thái | Đường dẫn sâu | Tới đâu |
|---|---|---|
| Có ảnh | `nook://moment/{id}` | Khoảnh khắc đó trong feed, đã cuộn sẵn tới nơi |
| Trống | `nook://camera` | Màn camera |
| Chưa đăng nhập | `nook://` | Màn chào mừng |

Cỡ vừa có hai vùng chạm: chạm ảnh vào khoảnh khắc, chạm hàng avatar vào Góc của bạn.
Cỡ nhỏ chỉ một vùng chạm cho cả widget.

---

## 3. Widget lấy ảnh ở đâu

**Widget không gọi mạng.** Cả hai hệ điều hành đều cắt ngắn hoặc giết tiến trình widget
nếu nó chờ mạng, và ảnh sẽ hiện chậm hoặc không hiện. Luật: **app tải ảnh về trước, ghi
vào chỗ dùng chung, rồi báo widget vẽ lại.**

| | iOS | Android |
|---|---|---|
| Chỗ dùng chung | App Group `group.app.nook` — ảnh ghi vào container của group | Thư mục riêng của app + `SharedPreferences` |
| Cái được ghi | Ảnh đã cắt cỡ (≤ 512px, JPEG q80) + một file JSON nhỏ: tên, thời gian, id, caption | Như iOS |
| Báo vẽ lại | `WidgetCenter.shared.reloadAllTimelines()` | `AppWidgetManager.updateAppWidget()` |

Nguồn kích hoạt: **thông báo đẩy im lặng.** Có ảnh mới → server đẩy → app tỉnh dậy trong
nền, tải ảnh, ghi vào chỗ dùng chung, gọi vẽ lại. Đây là phần backend, ghi ở `14-push.md`
khi tới lúc.

### Giới hạn phải biết trước

- **iOS có ngân sách vẽ lại.** Mỗi widget được vẽ lại khoảng 40–70 lần một ngày; xin
  vẽ lại nhiều hơn thì hệ thống lờ đi. Nghĩa là: **không** hẹn giờ 5 phút một lần. Chỉ
  vẽ lại khi thật sự có ảnh mới.
- **Android có sàn 30 phút** cho `updatePeriodMillis`. Muốn nhanh hơn thì đẩy từ server,
  đừng đặt hẹn giờ.
- **Ảnh phải nằm sẵn trên đĩa.** Widget hiện ảnh còn thiếu = ô xám. Ghi ảnh xong mới
  gọi vẽ lại, không làm ngược.

---

## 4. Cần gì để build

Widget **không chạy được trên Expo Go.** Phải chuyển sang **development build**
(`npx expo prebuild` + build máy thật). Đây là quyết định phải chốt trước khi bắt đầu,
vì đổi cách chạy dự án là đổi thói quen của cả team.

| Việc | Bên nào | Ghi chú |
|---|---|---|
| Bật development build | Cả hai | Sau bước này Expo Go không dùng được nữa |
| Widget extension bằng SwiftUI | iOS | Target riêng trong Xcode; dùng `expo-apple-targets` để không mất khi prebuild lại |
| Khai báo App Group | iOS | Cả app và widget cùng group thì mới đọc chung được file |
| `AppWidgetProvider` + layout RemoteViews | Android | RemoteViews chỉ dựng được vài loại view — không dùng được component RN |
| Config plugin để giữ file native | Cả hai | Không có plugin thì `prebuild` xoá mất phần native tự thêm |
| Hàm ghi ảnh + JSON vào chỗ dùng chung | RN | Một module nhỏ, gọi sau khi tải ảnh xong |

Ước lượng: **iOS 2–3 ngày, Android 2–3 ngày**, chưa tính phần đẩy thông báo.

---

## 5. Giao diện widget phải theo luật riêng

Widget nằm trên nền ảnh và trên hình nền máy người ta, nên vài luật của app không dùng được:

- **Không dùng `textFaint` trên ảnh.** Chữ trên ảnh luôn là `text` và luôn có lớp tối phía sau.
- **Chữ nhỏ nhất 11px** và không phóng theo cỡ chữ hệ thống — widget không cuộn được, chữ to là vỡ.
- **Không hào quang, không chuyển động.** Widget vẽ tĩnh, mỗi lần vẽ lại là một ảnh mới.
- **Không nút.** Cả hai hệ chỉ cho vùng chạm, không có trạng thái nhấn.
- Bo góc để hệ điều hành lo. Đừng tự bo rồi lòi mép.

---

## 6. Chia bản

| Bản | Nội dung |
|---|---|
| **V0.1** (nếu kịp) | Cỡ nhỏ, một ảnh mới nhất, trạng thái trống, chạm mở app |
| **V0.2** | Cỡ vừa, hàng avatar, widget màn khoá (iOS), chọn xem góc của một người cụ thể |
| **V0.3** | Widget đôi cho cặp Inner Circle (cấp 10) |

Nếu tuần cuối trước khi phát hành widget vẫn chưa đẹp thì **đẩy sang V0.2**. Ship một
widget xấu còn hại hơn không có widget — nó nằm ngay trên màn hình chủ, ai cũng thấy.

---

## 7. Nghiệm thu

- [ ] Cài app xong, chưa đăng nhập: widget hiện dấu hiệu + một câu, không hiện ô xám
- [ ] Đăng nhập, góc trống: hiện "Chưa có gì mới", chạm vào ra camera
- [ ] Bạn bè đăng ảnh: widget đổi trong vòng một phút sau khi thông báo tới
- [ ] Tắt mạng: widget vẫn hiện ảnh cũ, không hiện ô xám
- [ ] Chạm widget khi app đã đóng hẳn: mở đúng khoảnh khắc, không rơi về màn mặc định
- [ ] Đặt widget ở cả nền sáng và nền tối của máy — chữ vẫn đọc được
- [ ] Máy Samsung có bộ khởi chạy One UI: widget không bị bóp méo tỉ lệ
