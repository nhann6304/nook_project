# Nook frontend — ngữ cảnh cho Claude Code

Đây là ngữ cảnh cho **app**. Luật chung cho cả dự án ở [`../CLAUDE.md`](../CLAUDE.md);
hệ thống sản phẩm ở [`../.docs/01-product-system.md`](../.docs/01-product-system.md).

Mọi lệnh trong file này chạy từ thư mục `frontend/`.

**Stack:** Expo SDK **54** + React Native 0.81.5 + TypeScript 5.9. Chưa có backend;
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
- **Đừng nâng SDK.** Expo Go trên App Store kẹt ở 54.0.2 — nâng là app không mở
  được trên iPhone nữa. Lý do đầy đủ + ba chỗ code phải đảo ngược: mục 7 của
  `docs/06-libraries.md`.
- Chạy `npm run check` trước khi coi là xong. Phải sạch cả tsc lẫn eslint.

**Giao diện**

- Nền tối mặc định, **năm bảng màu** cho người dùng chọn. Không làm chế độ sáng ở V0.1.
- **Mỗi màn đúng MỘT** nút `variant="primary"`.
- Chữ trên nút primary là màu **tối** (`c.onAccent`), không phải trắng — chữ
  trắng trên dải màu chỉ đạt 1.9–2.5:1 ở mọi bảng.
- Khung ngắm camera lấy cạnh bằng số **nhỏ hơn** của hai thứ: **100%** bề ngang
  máy, và chiều cao thật đo bằng `onLayout`. Đừng tính tay từ chắn tai thỏ.
  Đo trên ảnh Locket: khung của họ 413/414pt — tràn mép, và **vuông**.
- **Có thanh tab ba chỗ** (Khoảnh khắc · Camera · Trò chuyện), tự vẽ, không
  dùng thanh mặc định của navigator. Luật cũ "không thanh tab, điều hướng bằng
  cử chỉ" đã bỏ 01/09/2026: cử chỉ vuốt lên **chưa bao giờ tồn tại trong code**,
  nên trên thực tế không có cử chỉ nào để học, chỉ có nút nằm rải ba góc.
- **Tab thì `navigate`, màn chồng thì `push`.** Chuyển giữa ba tab không được
  đẻ ra lịch sử — không ai "quay lại" khỏi màn camera.
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
- [x] **Thanh tab ba chỗ** + **Trò chuyện** (danh sách + một cuộc), nối từ feed
- [x] Caption nằm TRONG ảnh ở cả lúc gửi lẫn trong feed
- [x] Xin quyền camera: có nhánh "đã từ chối" mở Cài đặt máy + tự đọc lại khi quay về
- [x] Điều hướng expo-router có kiểu, kho trạng thái Zustand
- [x] Icon PNG cho store đã xuất; wordmark "nook" vẽ lại bằng SVG
- [ ] Onboarding — còn 3 màn: Tên và ảnh, Mời người đầu tiên, Xin quyền
- [ ] Cài đặt: mới có hàng Ngôn ngữ. Còn Vị trí, Thông báo, Tài khoản
- [ ] Thêm bạn — đặc tả xong, chưa code
- [ ] "Lưu về máy" ở màn Vừa chụp xong — cần `expo-media-library` + xin quyền ghi
- [ ] Chưa đo hiệu năng trên máy Android tầm trung
- [ ] Widget: thiết kế xong, chưa viết mã gốc — **cần development build**
- [ ] Supabase: chưa khởi tạo

## Việc tiếp theo hợp lý

Gần nhất: màn **Tên + ảnh** để đi hết một lượt onboarding (màn 4).

Sau đó: **Thêm bạn** (màn 12–13) — hiện ô `+` ở hàng người chỉ mở màn Góc, chưa
mời được ai thật.

Cần quyết sớm: **có chuyển sang development build không.** Hiện mọi thứ còn chạy
trên Expo Go (quét QR là xem được trên máy thật). Widget và `react-native-mmkv`
đều cần dev build. Chốt muộn thì đang giữa chừng phải đổi cả cách chạy dự án.
