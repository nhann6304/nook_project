# Nook frontend — ngữ cảnh cho Claude Code

Đây là ngữ cảnh cho **app**. Luật chung cho cả dự án ở [`../CLAUDE.md`](../CLAUDE.md);
hệ thống sản phẩm ở [`../.docs/01-product-system.md`](../.docs/01-product-system.md).

Mọi lệnh trong file này chạy từ thư mục `frontend/`.

**Stack:** Expo SDK **57** + React Native 0.86.3 + TypeScript 6.0. Chưa có backend;
`src/features/auth/lib/authApi.ts` là hàng giả (mã đúng: `123456`).

---

## ⚠ Trước khi viết dòng `.tsx` đầu tiên

Gọi skill **`nook-ui`** (`../.claude/skills/nook-ui/SKILL.md`). Nó là luật dựng
giao diện: dùng mảnh nào có sẵn, cái gì bị cấm, vì sao. Ba câu tóm tắt:

1. **Không tự chế** — mọi thứ nhìn thấy được đã có trong `@ui`.
2. **Không viết số** — khoảng cách/bo góc/nhịp nằm trong `@design`; màu qua
   `useStyles`/`useColors` vì người dùng đổi được bảng màu.
3. **Không viết chữ** — mọi câu hiện ra nằm trong `@i18n`, hai thứ tiếng.
4. **Mượt là yêu cầu, không phải điểm cộng** — xem `docs/08-performance.md`.

ESLint chặn cứng cả bốn. Thấy mình đang tìm cách lách nó là đang đi sai đường.

## Đọc theo thứ tự này

1. `docs/00-README.md` — bản đồ tài liệu frontend.
2. `../.docs/01-product-system.md` — **mục 0 và mục 3 trước tiên**, đó là triết lý
   gốc quyết định mọi thứ khác.
3. `docs/07-architecture.md` — cây thư mục, thứ mình sắp viết đặt ở đâu.
4. `docs/08-performance.md` — bảy luật giữ app mượt.
5. `docs/09-i18n.md` — thêm một câu chữ thế nào (đọc trước khi gõ chữ đầu tiên).
6. `docs/06-libraries.md` — gói nào đã cài và **vì sao**; cả gói đã bỏ.
7. `docs/01-brand.md` · `docs/02-ui-system.md` · `docs/03-screen-specs.md`.
8. `src/design/tokens.ts` · `src/components/index.ts` · `src/i18n/locales/vi.ts`
   — ba nguồn sự thật của code.

## Nguyên tắc không được phá

**Kỹ thuật**

- `src/design/` là **nơi duy nhất** được viết mã màu. ESLint chặn ở mọi chỗ khác.
- **Màu đi qua hook, không phải hằng số.** `@design` không xuất `color` nữa:
  ```tsx
  const make = (c: Palette) => StyleSheet.create({ box: { backgroundColor: c.surface } });
  function Thing() {
    const s = useStyles(make);   // StyleSheet theo bảng màu đang chọn
    const c = useColors();       // màu rời, cho prop color của icon
  }
  ```
  `make` phải khai ở **tầng module**, không khai trong thân component — khai
  trong thân là mỗi lần vẽ một khoá mới và bảng nhớ không bao giờ trúng.
- `src/i18n/locales/` là **nơi duy nhất** được viết câu tiếng Việt. Màn hình gọi
  `t('khoá')`; ngoài React thì gọi `translate('khoá')`. Thêm khoá vào `vi.ts` là
  tsc lập tức đòi bản `en.ts` — không có cách nào để một câu chưa dịch lọt ra.
- `src/components/` **không được gọi `t()`** — nhãn trợ năng nhận qua props.
- Màn hình **không biết router tồn tại** — nhận `onX` qua props. File trong
  `app/` là chỗ nối.
- Màn hình **không biết server tồn tại** — mọi lệnh gọi mạng ở `*Api.ts`.
- Animation: **Reanimated**, không bao giờ `Animated` của react-native.
- Danh sách: `<List>` (FlashList), không bao giờ `FlatList`.
- Ảnh: `<Img>` (expo-image), không bao giờ `<Image>`.
- Không `style={{…}}` viết thẳng trong JSX.
- Đọc kho trạng thái bằng selector: `useAuth((s) => s.phase)`.
- **SDK đi theo Expo Go trên App Store.** 27/09/2026 Expo Go iPhone đã lên 57
  nên dự án nâng lên 57. Expo Go đổi SDK thì dự án phải đổi theo, không thì
  "Project is incompatible". Xem mục 7 của `docs/06-libraries.md`.
- Ghi shared value bằng `sv.set(x)`, không `sv.value = x` — luật
  `react-hooks/immutability` của SDK 57 chặn cách gán.
- Chạy `npm run check` trước khi coi là xong. Phải sạch cả tsc lẫn eslint.

**Giao diện**

- Màu **Tự động theo trời** là mặc định (bảng thiết kế F1/15b): sáng + trưa là nền SÁNG, chiều tối + đêm là nền tối (`skyAt` trong `palettes.ts`). Hoặc giữ cố định một trong **năm bảng** tối. Chữ trên ảnh dùng `tone="onPhoto"` (luôn sáng), đừng dùng màu chữ thường.
- **Mỗi màn đúng MỘT** nút `variant="primary"`.
- Chữ trên nút primary là màu **tối** (`c.onAccent`), không phải trắng — chữ
  trắng trên dải màu chỉ đạt 1.9–2.5:1 ở mọi bảng.
- Khung ảnh **vuông 1:1** (`layout.cameraFrameRatio`, đổi 02/10/2026 — 3:4 dài
  quá), CHUNG cho camera và mọi khoảnh khắc. Ảnh chụp / chọn từ máy được CẮT
  đúng khung (`camera/lib/squarePhoto.ts`) và camera trước để `mirror` — thấy
  gì gửi nấy. Máy cao thì khung nằm giữa phần dư (`frame.top`).
- Chuyển cảnh chỉ dùng **transform + opacity**. Lướt trang đi thẳng theo ngón
  tay, không lún/thu nhỏ (bản cũ nhìn như nhảy lên xuống, Android giật khung camera).
- **Không nảy.** Thứ hiện ra dùng `FadeIn…duration(...)`, không `.springify()`;
  `spring.*` đã tắt dần tới hạn — đổi số thì giữ `damping ≥ 2·√(stiffness·mass)`.
- Bàn phím **không co khung** ở màn chính: chú thích tự nhích lên
  (`useAnimatedKeyboard`), trang giữ nguyên chiều cao.
- **Không thanh tab** (bảng thiết kế bản 7, thay luật 01/09/2026). Màn chính
  `app/(app)/home.tsx` là camera ở trang 0 + ảnh bạn bè từng trang bên dưới,
  **vuốt lên** là tới (`<Pager>`). Góc trái → bạn bè (trượt từ trái), góc phải
  → tin nhắn (trượt từ phải). Chữ: **Plus Jakarta Sans**, tiêu đề nét 800.
- **Không có linh vật** (bỏ 31/08/2026). Chỗ trống dùng `<GhostFrame>` hoặc
  lưới mười chỗ.
- Wordmark **chỉ** ở màn Chào mừng; dấu hiệu `<Rings>` thì dùng trong app.
- Vùng chạm tối thiểu `layout.minTouch` (48).
- `c.textDisabled` **không phải màu chữ đọc được** (~2.4:1 ở mọi bảng).
- Không hiện số like/lượt xem công khai, không bảng xếp hạng giữa bạn bè.
- Cấp thân chỉ hai người trong cặp nhìn thấy.
- Ba từ **cấm** trong chữ hiện cho người dùng: *điểm*, *hạng*, *nhiệm vụ*
  (tiếng Anh: *points*, *rank*, *quest*). Không chữ kỹ thuật ("OTP", "xác thực",
  "hợp lệ", "verify", "valid").
- Wordmark "nook" vẽ bằng SVG, **hai chữ "o" chính là hai vòng của dấu hiệu** —
  nên không đặt `<Rings>` cạnh `<Wordmark>` nữa.

**Hai nền tảng** — bẫy đã gặp, đừng đạp lại

- `<Field key={method}>` — không thay key thì **Android** giữ nguyên bàn phím cũ.
- `borderStyle:'dashed'` + `borderRadius` → **Android** vẽ ra nét **liền**.
  Nét đứt phải bằng SVG.
- iOS dùng `<Screen keyboard>`; Android đã có `adjustResize` trong `app.json`.
  Làm cả hai là màn co hai lần.

## Trạng thái hiện tại

- [x] Dự án Expo chạy được trên iPhone thật qua Expo Go. Bundle sạch cả hai nền
      tảng, `expo-doctor` 17/17.
- [x] Hệ token, style chung, 28 component, luật ESLint riêng
- [x] React Compiler bật; Reanimated / FlashList / expo-image đã vào đúng chỗ
- [x] Màn Chào mừng, Đăng nhập, Nhập mã, Camera, Vừa chụp xong, Khoảnh khắc, Góc
- [x] **Hai thứ tiếng** (vi + en), an toàn kiểu, đổi trong Cài đặt — `docs/09-i18n.md`
- [x] **Năm bảng màu** người dùng chọn được, mọi cặp đã đo WCAG — `docs/10-theme.md`
- [x] Camera: khung TRÀN MÉP, đèn (camera trước dùng đèn màn hình), chọn ảnh có sẵn
- [x] Màn chính lướt dọc camera → ảnh bạn bè, lưới "Tất cả ảnh" mở kiểu cửa sổ, ảnh gửi bay về góc
- [x] **Tin nhắn** (danh sách + một cuộc), nối từ ảnh bạn bè
- [x] Caption nằm TRONG ảnh ở cả lúc gửi lẫn trong feed
- [x] Xin quyền camera: có nhánh "đã từ chối" mở Cài đặt máy + tự đọc lại khi quay về
- [x] Điều hướng expo-router có kiểu, kho trạng thái Zustand
- [x] Icon PNG cho store đã xuất; wordmark "nook" vẽ lại bằng SVG
- [x] Màn **Tên + ảnh** (người mới, sau khi nhập mã): tên hiện, @tên riêng tự gợi ý, ảnh đại diện — hàng giả `profile/lib/profileApi.ts`
- [ ] Onboarding — còn 2 màn: Mời người đầu tiên, Xin quyền
- [ ] Cài đặt: mới có hàng Ngôn ngữ. Còn Vị trí, Thông báo, Tài khoản
- [x] **Thêm bạn** (hàng giả `circle/lib/circleApi.ts`): ô tìm — lọc người trong góc theo tên, tìm người trên Nook CHỈ theo @tên; mời · nhận lời · từ chối. Danh sách bạn ở kho `circle/store/circleStore.ts`, mọi màn đọc chung. Còn chờ backend
- [ ] "Lưu về máy" ở màn Vừa chụp xong — cần `expo-media-library` + xin quyền ghi
- [ ] Chưa đo hiệu năng trên máy Android tầm trung
- [ ] Widget: thiết kế xong, chưa viết mã gốc — **cần development build**
- [ ] Supabase: chưa khởi tạo

## Việc tiếp theo hợp lý

Gần nhất: nối `authApi.ts`, `circleApi.ts`, `profileApi.ts` vào server khi backend
có đường — màn hình không phải sửa.

Cần quyết sớm: **có chuyển sang development build không.** Hiện mọi thứ còn chạy
trên Expo Go (quét QR là xem được trên máy thật). Widget và `react-native-mmkv`
đều cần dev build. Chốt muộn thì đang giữa chừng phải đổi cả cách chạy dự án.
