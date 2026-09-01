# Nook — Trước khi lên store

Không phải việc của tuần này, nhưng vài mục phải quyết **sớm** vì càng để lâu càng đắt.
Mục nào có dấu ⏰ là loại đó.

---

## 1. Tên ⏰

Nook hiện đã có ít nhất 3 app xã hội trùng tên trên store, cộng thêm Barnes & Noble NOOK
đăng ký cho phần mềm. Dùng Nook làm codename khi build, nhưng trước khi phát hành:

- [ ] Tra App Store + Google Play bằng tên định chọn
- [ ] Tra nhãn hiệu tại Cục Sở hữu trí tuệ Việt Nam (nhóm 9 và 42)
- [ ] Kiểm tra domain `.com` và handle Instagram / TikTok
- [ ] Ưu tiên tên tự đặt (coined) — dễ giành nhãn hiệu và lên top tìm kiếm hơn hẳn từ có sẵn

Đổi tên sau khi có người dùng thật là mất trắng nhận diện. Chốt trước khi mời nhóm bạn đầu tiên.

## 2. Logo

Dự án **không có linh vật** — bỏ ngày 31/08/2026, xem `../frontend/docs/01-brand.md` mục 4.

- [ ] Tra hình hai vòng lồng nhau trên cơ sở dữ liệu nhãn hiệu hình (nhóm 9 và 42) —
      hai vòng tròn là hình phổ biến, phải tra trước khi đăng ký
- [ ] Thu icon về 40×40 và kiểm còn tách được hai vòng không
- [ ] Xuất PNG 1024 (App Store) và 512 (Play Store), cộng bản một màu cho thông báo

## 3. Bắt buộc để qua duyệt App Store

- [ ] Chức năng **xoá tài khoản** ngay trong app
- [ ] Chính sách riêng tư có URL công khai
- [ ] Giải thích lý do xin quyền camera / vị trí trong `Info.plist`
- [ ] Cơ chế **báo cáo và chặn người dùng** — app xã hội bắt buộc phải có
- [ ] Ghi rõ độ tuổi tối thiểu và có bước kiểm tra tuổi khi đăng ký
- [ ] Nếu sau này thêm đăng nhập bằng Google/Facebook thì **phải** thêm cả Sign in with
      Apple. Hiện Nook chỉ dùng email/SĐT của chính mình nên chưa bắt buộc ⏰

## 4. Hai nền tảng

- [ ] Thử trên máy thấp nhất còn hỗ trợ (iPhone SE) và một máy Android phổ thông
- [ ] Thử ở mức phóng chữ lớn nhất của hệ thống
- [ ] Thử với thanh cử chỉ **và** với ba nút điều hướng của Samsung
- [ ] `android:windowSoftInputMode="adjustResize"` — thiếu dòng này bàn phím che nút
- [ ] Thử khi máy đặt ngôn ngữ khác tiếng Việt (chữ không được vỡ khung)

## 5. Quyết định kỹ thuật phải chốt sớm ⏰

- [ ] **Development build hay Expo Go?** Có widget thì bắt buộc development build.
      Đổi giữa chừng là đổi thói quen chạy dự án của cả team — xem [`04-widget.md`](../frontend/docs/04-widget.md).
- [ ] Ảnh lưu bao lâu, cắt cỡ bao nhiêu (ảnh gốc rất tốn tiền lưu trữ)
- [ ] Có làm bản web không — nếu có thì phải nghĩ từ đầu, không chắp sau

## 6. Trước ngày mời nhóm bạn đầu tiên

- [ ] Đi hết một lượt: cài → chào mừng → tạo tài khoản → chụp → gửi → nhận → trả lời
- [ ] Thử với một máy chưa từng cài (không phải máy dev)
- [ ] Thử khi mạng chập chờn: bật chế độ máy bay giữa lúc đang gửi ảnh
- [ ] Có đường để người dùng báo lỗi cho team (một dòng trong Cài đặt là đủ)
