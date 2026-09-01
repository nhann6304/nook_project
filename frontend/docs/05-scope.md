# Nook — Phạm vi frontend

Danh sách để biết **khi nào FE coi là xong**. Cột "Bản" nói tính năng thuộc V0.1 hay để
sau. Cột "Trạng thái" cập nhật khi code xong — "xong" nghĩa là giao diện chạy được với
dữ liệu giả, chưa nối server.

Ranh giới với backend: màn hình nhận vào các hàm như `onSubmit`, `onVerify`, `onSend`
rồi gọi. Màn hình không tự gọi mạng, không biết server ở đâu — mọi lệnh gọi nằm
trong `src/features/<tên>/lib/*Api.ts`.

**Cập nhật 01/09/2026:** dự án đã thành một app Expo chạy được. `npm run dev` là
quét QR xem trên máy thật. Bảng dưới đã chấm lại theo code thật.

---

## 1. Vào app

| Chức năng | Bản | Trạng thái |
|---|---|---|
| Màn chào mừng: app icon có chuyển động, câu chính, hai nút | V0.1 | xong |
| Tắt chuyển động khi máy bật "giảm chuyển động" | V0.1 | xong |
| Ô điều khoản ở màn tạo tài khoản (chỗ giữ sẵn, chưa có nội dung) | V0.1 | xong |
| Nội dung Điều khoản dịch vụ + Chính sách riêng tư, có URL công khai | V0.1 | chưa |
| Chuyển Email ⇄ Số điện thoại trên cùng một ô nhập | V0.1 | xong |
| Kiểm email và đầu số Việt Nam ngay lúc gõ | V0.1 | xong |
| Chuẩn hoá số: `0912…`, `+84912…`, số dán từ danh bạ về một dạng | V0.1 | xong |
| Ô mã 6 số, tự điền mã từ tin nhắn / hộp thư | V0.1 | xong |
| Đủ 6 số tự kiểm, không cần nút xác nhận | V0.1 | xong |
| Đếm ngược gửi lại mã (60s) | V0.1 | xong |
| Đổi email / số khác ngay từ màn nhập mã | V0.1 | xong |
| Bốn trạng thái: đang gửi, gõ sai, mã sai, mất mạng | V0.1 | xong |
| Người mới đi tiếp sang đặt tên + ảnh; người cũ vào thẳng app | V0.1 | chưa |
| Đặt tên + chọn ảnh đại diện | V0.1 | chưa |
| Mời người đầu tiên (link / QR / danh bạ) | V0.1 | chưa |
| Xin quyền camera + thông báo, có giải thích trước | V0.1 | một phần — camera xong, thông báo chưa |
| Đăng xuất | V0.1 | chưa |
| Xoá tài khoản (App Store bắt buộc) | V0.1 | chưa |

## 2. Camera & gửi khoảnh khắc

| Chức năng | Bản | Trạng thái |
|---|---|---|
| Xem trước camera trong khung vuông 88% chiều ngang | V0.1 | xong |
| Chụp, đảo camera trước/sau | V0.1 | xong |
| Chọn ảnh từ thư viện | V0.1 | chưa |
| Gõ caption ngay trên ảnh | V0.1 | chưa |
| Gửi / huỷ ảnh vừa chụp, lưu về máy | V0.1 | chưa |
| Trạng thái góc trống (chưa có bạn) | V0.1 | xong — lưới mười chỗ |
| Đèn flash, hẹn giờ | V0.2 | — |

## 3. Khoảnh khắc & trò chuyện

| Chức năng | Bản | Trạng thái |
|---|---|---|
| Danh sách 48 giờ gần nhất, cuộn dọc | V0.1 | một phần — danh sách dựng bằng FlashList, chưa có dữ liệu |
| Skeleton lúc chờ (không dùng vòng xoay) | V0.1 | chưa |
| Kéo xuống để tải lại | V0.1 | chưa |
| Ba emoji phản hồi nhanh, gửi riêng | V0.1 | chưa |
| Ô "Nhắn riêng cho {tên}…" mở màn Trò chuyện | V0.1 | chưa |
| Bong bóng chat, ảnh gốc ghim trên đầu | V0.1 | chưa |
| Trạng thái đang gửi / gửi hỏng, bấm để gửi lại | V0.1 | chưa |

## 4. Góc của bạn

| Chức năng | Bản | Trạng thái |
|---|---|---|
| Lưới avatar, vòng độ thân, nhãn ngủ đông | V0.1 | xong |
| Ô trống viền đứt + nút mời | V0.1 | xong |
| Mời bằng link, mã QR, tìm trong danh bạ | V0.1 | chưa |
| Quét mã QR của bạn bè | V0.1 | chưa |
| Chi tiết tình bạn | V0.2 | — |

## 5. Cài đặt

| Chức năng | Bản | Trạng thái |
|---|---|---|
| Hàng hồ sơ, nhóm Riêng tư đứng đầu | V0.1 | chưa |
| Công tắc thông báo | V0.1 | chưa |
| Chặn và báo cáo người dùng (App Store bắt buộc) | V0.1 | chưa |
| Vị trí — công tắc tổng "Tắt hết vị trí" | V0.3 | — |

## 6. Widget

Chi tiết ở [`04-widget.md`](04-widget.md). Cần chuyển dự án sang development build trước.

| Chức năng | Bản | Trạng thái |
|---|---|---|
| Thiết kế widget nhỏ / vừa / trạng thái trống | V0.1 | xong (thiết kế) |
| Widget cỡ nhỏ trên iOS | V0.1 | chưa |
| Widget cỡ nhỏ trên Android | V0.1 | chưa |
| Ghi ảnh + JSON vào chỗ dùng chung, gọi vẽ lại | V0.1 | chưa |
| Đường dẫn sâu từ widget vào đúng khoảnh khắc | V0.1 | chưa |
| Widget cỡ vừa, widget màn khoá | V0.2 | — |

## 7. Nền chung — thiếu cái nào thì màn nào cũng hỏng

| Chức năng | Bản | Trạng thái |
|---|---|---|
| Vùng an toàn hai nền tảng (tai thỏ, đục lỗ, thanh cử chỉ) | V0.1 | xong |
| Bàn phím không che nút (iOS đẩy, Android co màn) | V0.1 | xong |
| Chữ phóng to được, có giới hạn | V0.1 | xong |
| Vùng chạm tối thiểu 48 | V0.1 | xong |
| Rung phản hồi đúng năm chỗ | V0.1 | xong — gom ở `src/lib/haptics.ts` |
| Toast báo lỗi mạng, thử lại | V0.1 | chưa |
| Empty state cho mọi danh sách | V0.1 | một phần — Góc và Khoảnh khắc xong, các màn khác chưa có |
| Bộ icon dùng chung | V0.1 | xong — Ionicons, không trộn bộ khác |
| Logo "Ôm": bản trần, một màu, ghost, app icon (SVG) | V0.1 | xong |
| Xuất app icon ra PNG 1024 + nền trước icon thích ứng Android | V0.1 | xong |
| `Rings` + `GhostFrame` thay chỗ linh vật ở mọi màn trống | V0.1 | xong |
| Màn hình chờ khi mở app (không chớp trắng) | V0.1 | xong — giữ splash tới khi nạp xong bộ chữ |

## 8. Nền kỹ thuật — mới, chưa có ở bản đầu

| Chức năng | Bản | Trạng thái |
|---|---|---|
| Dự án Expo chạy được, bundle sạch iOS + Android | V0.1 | xong — ghim SDK 54 để Expo Go trên iPhone mở được |
| Hệ token + style chung (`src/design`) | V0.1 | xong |
| Bộ 27 component qua một cửa `@ui` | V0.1 | xong |
| Luật ESLint chặn hex / style trong lúc vẽ / primitive thô | V0.1 | xong |
| Điều hướng expo-router có kiểu (`typedRoutes`) | V0.1 | xong |
| Kho trạng thái Zustand đọc bằng selector | V0.1 | xong |
| React Compiler bật | V0.1 | xong |
| Reanimated cho mọi animation | V0.1 | xong |
| FlashList cho mọi danh sách | V0.1 | xong |
| expo-image cho mọi ảnh | V0.1 | xong |
| Skill `nook-ui` cho AI đọc trước khi code | V0.1 | xong |
| Đo hiệu năng trên máy Android tầm trung | V0.1 | **chưa** |
| Cất thẻ đăng nhập vào Keychain/Keystore | V0.1 | chưa — chờ backend |
