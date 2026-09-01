# Nook frontend — ngữ cảnh cho Claude Code

Đây là ngữ cảnh cho **app**. Luật chung cho cả dự án ở [`../CLAUDE.md`](../CLAUDE.md);
hệ thống sản phẩm ở [`../.docs/01-product-system.md`](../.docs/01-product-system.md).

Mọi lệnh trong file này chạy từ thư mục `frontend/`.

**Stack:** React Native 0.86 + Expo SDK 57 + TypeScript 6. Chưa có backend;
`src/features/auth/lib/authApi.ts` là hàng giả (mã đúng: `123456`).

---

## ⚠ Trước khi viết dòng `.tsx` đầu tiên

Gọi skill **`nook-ui`** (`../.claude/skills/nook-ui/SKILL.md`). Nó là luật dựng
giao diện: dùng mảnh nào có sẵn, cái gì bị cấm, vì sao. Ba câu tóm tắt:

1. **Không tự chế** — mọi thứ nhìn thấy được đã có trong `@ui`.
2. **Không viết số** — màu/khoảng cách/nhịp nằm trong `@design`.
3. **Mượt là yêu cầu, không phải điểm cộng** — xem `docs/08-performance.md`.

ESLint chặn cứng cả ba. Thấy mình đang tìm cách lách nó là đang đi sai đường.

## Đọc theo thứ tự này

1. `docs/00-README.md` — bản đồ tài liệu frontend.
2. `../.docs/01-product-system.md` — **mục 0 và mục 3 trước tiên**, đó là triết lý
   gốc quyết định mọi thứ khác.
3. `docs/07-architecture.md` — cây thư mục, thứ mình sắp viết đặt ở đâu.
4. `docs/08-performance.md` — bảy luật giữ app mượt.
5. `docs/06-libraries.md` — gói nào đã cài và **vì sao**; cả gói đã bỏ.
6. `docs/01-brand.md` · `docs/02-ui-system.md` · `docs/03-screen-specs.md`.
7. `src/design/tokens.ts` và `src/components/index.ts` — nguồn sự thật của code.

## Nguyên tắc không được phá

**Kỹ thuật**

- `src/design/` là **nơi duy nhất** được viết mã màu. ESLint chặn ở mọi chỗ khác.
- Màn hình **không biết router tồn tại** — nhận `onX` qua props. File trong
  `app/` là chỗ nối.
- Màn hình **không biết server tồn tại** — mọi lệnh gọi mạng ở `*Api.ts`.
- Animation: **Reanimated**, không bao giờ `Animated` của react-native.
- Danh sách: `<List>` (FlashList), không bao giờ `FlatList`.
- Ảnh: `<Img>` (expo-image), không bao giờ `<Image>`.
- Không `style={{…}}` viết thẳng trong JSX.
- Đọc kho trạng thái bằng selector: `useAuth((s) => s.phase)`.
- **Đừng "sửa"** `react` về 19.2.3 — xem mục 7 của `docs/06-libraries.md`.
- Chạy `npm run check` trước khi coi là xong. Phải sạch cả tsc lẫn eslint.

**Giao diện**

- Nền tối `color.bg` mặc định. Không làm chế độ sáng ở V0.1.
- **Mỗi màn đúng MỘT** nút `variant="primary"`.
- Chữ trên nút primary là màu **tối** (`color.onAccent`), không phải trắng —
  chữ trắng trên dải cam–hồng chỉ đạt 2.3:1.
- Khung ngắm camera tính theo **chiều ngang** máy (88%), không theo chiều dọc.
- **Không thanh tab.** Điều hướng bằng cử chỉ.
- **Không có linh vật** (bỏ 31/08/2026). Chỗ trống dùng `<GhostFrame>` hoặc
  lưới mười chỗ.
- Logo và wordmark **chỉ** ở màn Chào mừng.
- Vùng chạm tối thiểu `layout.minTouch` (48).
- `color.textDisabled` **không phải màu chữ đọc được** (2.55:1).
- Không hiện số like/lượt xem công khai, không bảng xếp hạng giữa bạn bè.
- Cấp thân chỉ hai người trong cặp nhìn thấy.
- Ba từ **cấm** trong chữ hiện cho người dùng: *điểm*, *hạng*, *nhiệm vụ*.
  Không chữ kỹ thuật ("OTP", "xác thực", "hợp lệ").

**Hai nền tảng** — bẫy đã gặp, đừng đạp lại

- `<Field key={method}>` — không thay key thì **Android** giữ nguyên bàn phím cũ.
- `borderStyle:'dashed'` + `borderRadius` → **Android** vẽ ra nét **liền**.
  Nét đứt phải bằng SVG.
- iOS dùng `<Screen keyboard>`; Android đã có `adjustResize` trong `app.json`.
  Làm cả hai là màn co hai lần.

## Trạng thái hiện tại

- [x] Dự án Expo chạy được. Bundle sạch cả iOS lẫn Android, `expo-doctor` 18/18.
- [x] Hệ token, style chung, 27 component, luật ESLint riêng
- [x] React Compiler bật; Reanimated / FlashList / expo-image đã vào đúng chỗ
- [x] Màn Chào mừng, Đăng nhập, Nhập mã, Camera, Góc (trống), Khoảnh khắc (trống)
- [x] Điều hướng expo-router có kiểu, kho trạng thái Zustand
- [x] Icon PNG cho store đã xuất; logo đã sang bảng màu song sắc
- [ ] Onboarding — còn 3 màn: Tên và ảnh, Mời người đầu tiên, Xin quyền
- [ ] Trò chuyện, Thêm bạn, Cài đặt (4 màn con) — đặc tả xong, chưa code
- [ ] Chưa đo hiệu năng trên máy Android tầm trung
- [ ] Widget: thiết kế xong, chưa viết mã gốc — **cần development build**
- [ ] Supabase: chưa khởi tạo

## Việc tiếp theo hợp lý

Gần nhất: màn **Tên + ảnh** để đi hết một lượt onboarding.

Cần quyết sớm: **có chuyển sang development build không.** Hiện mọi thứ còn chạy
trên Expo Go (quét QR là xem được trên máy thật). Widget và `react-native-mmkv`
đều cần dev build. Chốt muộn thì đang giữa chừng phải đổi cả cách chạy dự án.
