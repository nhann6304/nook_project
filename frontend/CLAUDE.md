# Nook frontend — ngữ cảnh cho Claude Code

Đây là ngữ cảnh cho **app**. Luật chung cho cả dự án ở [`../CLAUDE.md`](../CLAUDE.md);
hệ thống sản phẩm ở [`../.docs/01-product-system.md`](../.docs/01-product-system.md).

Mọi lệnh trong file này chạy từ thư mục `frontend/`.

**Stack:** Expo SDK **57** + React Native 0.86.3 + TypeScript 6.0.

**Nối server:** chép `.env.example` thành `.env`, điền `EXPO_PUBLIC_API_URL`.
Bỏ trống thì mọi `*Api.ts` chạy hàng giả (mã đăng nhập `123456`).

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
- Màn hình **không biết server tồn tại** — mọi lệnh gọi mạng ở `*Api.ts`, và
  mọi `*Api.ts` đi qua **`@/lib/api`** (`call`, `LIVE`), không tự `fetch`. Đường
  dẫn / mã lỗi / kiểu lấy từ `@nook/shared`, câu lỗi bằng `translateError(code)`.
  Thẻ: ngắn hạn ở bộ nhớ, dài hạn ở SecureStore, làm mới MỘT lượt cho cả app.
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

- Màu **xanh lam pastel, THEO TRỜI** (07/10/2026, mặc định): sáng · trưa · chiều · tối theo giờ máy, trời mưa thì sang màu mưa (`sceneAt` trong `palettes.ts`; mưa hỏi Open-Meteo ở `features/sky`, CHỈ khi người dùng đã cho quyền vị trí — không bao giờ tự xin). Hoặc cố định Sáng · Tối · Theo máy. Cộng **năm màu locket**. Chữ trên ảnh dùng `tone="onPhoto"`. Mặt nổi dùng `c.glass` + `lift(c)`, **không blur thật** (Android giật).
- **Mỗi màn đúng MỘT** nút `variant="primary"`.
- Chữ trên nút primary là `c.onAccent`: **trắng** ở nền sáng (nút denim đặc),
  **navy** ở nền tối (nút lam nhạt). Nút đặc, không dải màu.
- Khung ảnh **rộng/cao 0.9** — đứng hơn vuông một chút (`layout.cameraFrameRatio`,
  07/10/2026), CHUNG cho camera và mọi khoảnh khắc. Ảnh chụp / chọn từ máy được CẮT
  đúng khung (`camera/lib/squarePhoto.ts`) và camera trước để `mirror` — thấy
  gì gửi nấy. Máy cao thì khung nằm giữa phần dư (`frame.top`).
- Chuyển cảnh chỉ dùng **transform + opacity**. Lướt trang đi thẳng theo ngón
  tay, không lún/thu nhỏ (bản cũ nhìn như nhảy lên xuống, Android giật khung camera).
- Chuyển động lấy từ `motion` (`@design`); âm thanh qua `@/lib/sound` — đúng ba tiếng, tắt được trong Cài đặt.
- **Không nảy.** Thứ hiện ra dùng `FadeIn…duration(...)`, không `.springify()`;
  `spring.*` đã tắt dần tới hạn — đổi số thì giữ `damping ≥ 2·√(stiffness·mass)`.
- Bàn phím **không co khung** ở màn chính: chú thích tự nhích lên
  (`useAnimatedKeyboard`), trang giữ nguyên chiều cao.
- **Thanh tab dưới đáy, bốn nút** (07/10/2026): Chụp · Bạn bè · Tin nhắn ·
  Cài đặt (`app/(app)/(tabs)/`, `<TabBar>`: thẻ nổi cách mép, bo vừa, icon
  trần + vạch nhấn trên nút đang chọn — không viên thuốc, không dính đáy).
  Ảnh bạn bè KHÔNG là tab — vuốt lên từ camera như Locket (`<Pager>`); bấm
  "Chụp" khi đang ở màn chính thì về camera (`home/store/homeNav.ts`). Rời tab
  là camera tắt (`active`). Chuông thông báo ở góc phải màn chính.
- **Chụp xong:** hàng avatar dưới ảnh chọn ai KHÔNG được xem (mặc định ai cũng
  xem; mặc định riêng đặt ở Cài đặt → Riêng tư). Gửi đi là `hiddenFromUserIds`.
- **Đèn camera trước chỉ sáng TRONG KHUNG**, không trắng cả màn hình.
- **Icon: nét Phosphor kiểu DUOTONE** (`<Icon name>`, 08/10/2026) — nét vừa + ruột
  tô 24% cùng màu; `weight="fill"` cho thứ đang chọn (tab đang mở). Nét đơn
  (✓ × mũi tên +) tự đi nét đậm, không ô nền. Nét sinh vào `iconPaths.ts` bằng
  `node scripts/phosphor-icons.mjs` — thêm icon ở script, đừng sửa tay, đừng
  nhập gói lúc chạy. Màu icon theo `c.accent`, không `c.text`.
- **Nút KHỐI NỔI** (`<Button>`, 08/10/2026): mặt + gờ đáy đậm hơn, nhấn thì mặt
  lún phủ gờ (luồng UI). Thẻ nổi bật (Pro) đi cùng giọng: gờ `accentDeep`.
- **"Theo ảnh" là màu mặc định** (08/10/2026): gửi ảnh xong app rút màu chủ đạo
  (`camera/lib/photoColor.ts`) → `setSeed` → sắc nhấn + cảnh ngả theo màu đó,
  tương phản ĐO lúc dựng (`seedSwatch` trong `palettes.ts`). Năm màu locket vẫn chọn được.
- **Vòng tay hạt thay vòng cấp thân** (`<Bracelet>` quanh `<Avatar level>`,
  `<BeadStrand>` ở trang hai người): mỗi hạt một ký ức, chất liệu nói độ thân
  (gỗ → vỏ sò → màu riêng → ngọc → vàng, `design/beads.ts`). Không số.
- **Trời có cảnh** (`<SkyWash>`): mây trôi / mặt trời / sao / mưa — chỉ
  transform + opacity, mỗi lớp một Svg vẽ một lần.
- **Ảnh gốc cho mọi người**: chụp `quality: 1`, cắt khung rồi nén JPEG MỘT lần
  0.92, KHÔNG thu nhỏ. Không bao giờ đưa chất lượng ảnh vào gói Pro.
- **Cài đặt = mục lục + trang con** (`app/(app)/prefs/*`): Giao diện · Riêng tư ·
  Ngôn ngữ mở trang riêng giữ BẢN NHÁP, bấm **Lưu** mới áp dụng và gọi
  `settingsApi.saveSettings` MỘT lần (không ghi server mỗi lần chạm). Giao diện
  có hình xem trước vẽ bằng bảng nháp (`previewPalette`). Âm thanh là công tắc
  tại chỗ. Danh sách đông người luôn có ô tìm (`AudienceSheet`, Tìm quanh đây).
- **Chụp không có vòng chờ:** ảnh gốc hiện ngay, cắt vuông chạy ngầm
  (`squaring` trong `CameraPage`), tải lên server chạy nền sau khi gửi.
- Chữ: **Poppins** đậm một nấc (chữ thường 500, tiêu đề 700, `display` 800) + **Caveat** cho lời nhấn viết
  tay (`variant="hand"`, mỗi màn tối đa một chỗ).
- **Không có linh vật** (bỏ 31/08/2026). Chỗ trống dùng `<GhostFrame>` hoặc
  lưới mười chỗ.
- Wordmark **chỉ** ở màn Chào mừng; dấu hiệu `<Rings>` thì dùng trong app.
- Vùng chạm tối thiểu `layout.minTouch` (48).
- `c.textDisabled` **không phải màu chữ đọc được** (~2.1:1 ở mọi bảng).
- Không hiện số like/lượt xem công khai, không bảng xếp hạng giữa bạn bè.
- Cấp thân chỉ hai người trong cặp nhìn thấy.
- Ba từ **cấm** trong chữ hiện cho người dùng: *điểm*, *hạng*, *nhiệm vụ*
  (tiếng Anh: *points*, *rank*, *quest*). Không chữ kỹ thuật ("OTP", "xác thực",
  "hợp lệ", "verify", "valid").
- **Tên app: LOVO** (đổi 07/10/2026). Logo theo mẫu: chữ phồng nét dày, chữ O
  đầu là trái tim KÍNH phát sáng, chữ "o" cuối là MẶT CƯỜI; icon nền navy.
  Trong app phát sáng bằng nét chồng, không dùng bộ lọc blur (Android giật). Icon app + splash dựng bằng
  `node scripts/brand-icons.mjs`. Mã nội bộ (`@nook/shared`, bundle id, scheme)
  vẫn giữ chữ `nook` — đổi là vỡ cài đặt cũ và liên kết.

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
- [x] **Nền sáng/tối + năm màu locket** người dùng chọn được, mọi cặp đã đo WCAG — `docs/10-theme.md`
- [x] **Thanh tab 3 nút** · Cài đặt làm lại (trang của mình + số ảnh 30 ngày ở đầu) · khung bừng sáng khi chụp
- [x] Camera: khung TRÀN MÉP, đèn (camera trước dùng đèn màn hình), chọn ảnh có sẵn
- [x] Màn chính lướt dọc camera → ảnh bạn bè, lưới "Tất cả ảnh" mở kiểu cửa sổ, ảnh gửi bay về góc
- [x] **Tin nhắn** (danh sách + một cuộc), nối từ ảnh bạn bè
- [x] Caption nằm TRONG ảnh ở cả lúc gửi lẫn trong feed
- [x] Xin quyền camera: có nhánh "đã từ chối" mở Cài đặt máy + tự đọc lại khi quay về
- [x] Điều hướng expo-router có kiểu, kho trạng thái Zustand
- [x] Icon PNG cho store đã xuất; wordmark "nook" vẽ lại bằng SVG
- [x] Màn **Tên + ảnh** (người mới, sau khi nhập mã): tên hiện, @tên riêng tự gợi ý, ảnh đại diện — hàng giả `profile/lib/profileApi.ts`
- [ ] Onboarding — còn 2 màn: Mời người đầu tiên, Xin quyền
- [x] **Thông báo** (chuông + chấm đỏ, màn `notifications`): mời, nhận lời, tag, cảm xúc, trả lời. Hàng giả `notify/lib/notifyApi.ts` — hợp đồng `INotification` đã ở `@nook/shared`, server chưa có module
- [ ] Cài đặt: còn Vị trí, Thông báo đẩy. Tài khoản mới có Đăng xuất
- [x] **Video ngắn**: giữ nút chụp quay ≤ 3 giây (vòng đếm), phát lặp trong feed chỉ ở trang đang xem
- [x] **Nối server**: đăng nhập (xin mã, nộp mã, làm mới thẻ, đăng xuất) và lưu hồ sơ + ảnh đại diện chạy thật khi có `EXPO_PUBLIC_API_URL`. Gửi khoảnh khắc đã gọi đúng hợp đồng `POST /v1/moments` — **server chưa có module `moment`**. Góc bạn bè, trang người khác, khoá trang, tìm quanh đây: vẫn giả vì server chưa có đường
- [x] **Thêm bạn** (hàng giả `circle/lib/circleApi.ts`): ô tìm — lọc người trong góc theo tên, tìm người trên Nook CHỈ theo @tên; mời · nhận lời · từ chối. Danh sách bạn ở kho `circle/store/circleStore.ts`, mọi màn đọc chung. Còn chờ backend
- [x] **Tag bạn** trong chú thích (gõ `@`, chỉ bạn trong góc, tối đa 5) → chạm tên mở **trang cá nhân** (`person/[id]`). **Khoá trang** trong Cài đặt: người ngoài góc chỉ thấy tên, ảnh, @tên. Thông báo cho người được tag là việc của server
- [x] **Tìm quanh đây** (`nearby`, giao diện 07/10/2026: trang bật định vị chọn 100 m · 200 m · 300 m · 1 km · 3 km → RADAR có avatar xếp theo nấc khoảng cách, vòng sóng lan, chạm avatar mở thẻ người + danh sách có ô tìm bên dưới; không bản đồ thật — server không trả toạ độ): người dùng chọn bán kính 100 m – 3 km; chỉ người cũng đang bật thấy nhau, chỉ hiện nấc khoảng cách, tự tắt sau 5 phút. Hàng giả `nearby/lib/nearbyApi.ts` — luật cho server ghi ở đầu tệp đó
- [ ] "Lưu về máy" ở màn Vừa chụp xong — cần `expo-media-library` + xin quyền ghi
- [ ] Chưa đo hiệu năng trên máy Android tầm trung
- [ ] Widget: thiết kế xong, chưa viết mã gốc — **cần development build**
- [ ] Supabase: chưa khởi tạo

## Việc tiếp theo hợp lý

Gần nhất: khi backend có `moment` / `circle`, thay ruột `momentApi.ts`, `circleApi.ts`
theo khuôn của `authApi.ts` (`if (!LIVE) giả; else call(...)`) — màn hình không phải sửa.

Cần quyết sớm: **có chuyển sang development build không.** Hiện mọi thứ còn chạy
trên Expo Go (quét QR là xem được trên máy thật). Widget và `react-native-mmkv`
đều cần dev build. Chốt muộn thì đang giữa chừng phải đổi cả cách chạy dự án.
