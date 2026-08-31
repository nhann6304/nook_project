# Nook — ngữ cảnh dự án cho Claude Code

Đây là app xã hội "Locket + Friendship RPG": camera-first, circle 10 người bạn,
độ thân được biến thành progression system nhưng không dùng XP/nhiệm vụ mà dùng
một đơn vị duy nhất là **"ký ức"** (memory) — tương tác hai chiều thật giữa hai người.

Stack: **React Native (Expo) + TypeScript + Supabase**. Chưa có backend thật, đang ở
giai đoạn dựng UI với dữ liệu giả.

## Đọc theo thứ tự này trước khi code

1. `docs/01-product-system.md` — hệ thống sản phẩm: đơn vị "ký ức", cấp độ tình bạn
   1–10, cơ chế chống farm/spam, consent ladder cho tính năng vị trí, roadmap V0.1→V0.4.
   **Đọc mục 0 và mục 3 trước tiên** — đó là triết lý gốc quyết định mọi thứ khác.
2. `docs/02-visual-system.md` — brand: bảng màu, font, component, chữ nghĩa tiếng Việt,
   chuyển động, checklist trước khi lên store.
3. `docs/03-screen-specs.md` — đặc tả chi tiết 17 màn hình đã thiết kế và duyệt.
   Dùng làm nguồn tham chiếu khi implement từng màn.
4. `theme/tokens.ts` — mọi màu/spacing/type đã code sẵn, import từ đây, **không viết
   hex trực tiếp trong component**.
5. `components/ui.tsx` — bộ component lõi đã build: Screen, Txt, Button, Avatar,
   EmptyState, v.v. Lắp màn hình từ những mảnh này trước, chỉ viết mới khi thật sự
   thiếu.
6. `screens/CameraScreen.tsx` — màn hình mẫu đã hoàn chỉnh, dùng làm khuôn mẫu về
   style/cấu trúc cho các màn còn lại.

## Nguyên tắc không được phá khi code tiếp

- Nền tối `#0E0D0C` mặc định, không làm chế độ sáng ở V0.1.
- Khung ngắm camera tính theo **chiều ngang máy** (88%), không theo chiều dọc —
  xem comment trong `CameraScreen.tsx`.
- Không tab bar. Điều hướng bằng cử chỉ (chạm avatar, vuốt lên, bánh răng).
- Không hiển thị số like/react công khai, không bảng xếp hạng giữa các bạn.
- Cấp độ tình bạn chỉ hai người trong cặp nhìn thấy.
- Ba từ cấm trong microcopy: điểm, hạng, nhiệm vụ.
- Vùng chạm tối thiểu 48pt cho mọi phần tử bấm được (đã set trong `layout.minTouch`).

## Trạng thái hiện tại

- [x] Design tokens, component library cơ bản
- [x] Màn Camera (chưa nối logic gửi ảnh thật)
- [ ] Onboarding 5 màn (đặc tả xong, chưa code)
- [ ] Feed, Trò chuyện (đặc tả xong, chưa code)
- [ ] Góc của bạn, Thêm bạn (đặc tả xong, chưa code)
- [ ] Cài đặt — 4 màn con (đặc tả xong, chưa code)
- [ ] Supabase: chưa khởi tạo project, chưa có schema

## Việc tiếp theo hợp lý

Xem `docs/03-screen-specs.md` mục "Việc cần làm khi implement" — thứ tự ưu tiên
đã liệt kê sẵn theo nhóm A/B/C/D.
