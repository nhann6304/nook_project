# Nook — Hệ thống sản phẩm

Từ ý tưởng "Locket + Friendship RPG" → bản thiết kế build được cho team 1–3 dev.

Phạm vi tài liệu: nguyên tắc thiết kế, đơn vị lõi "memory", spec V0.1, hệ thống Friendship Level 1–10, cơ chế chống farm, consent ladder cho WhereAreYou, monetization, roadmap và metrics.

---

## 0. Ba nguyên tắc thiết kế

Mọi quyết định bên dưới đều suy ra từ ba điều này:

1. **Thưởng cho những gì tự nhiên xảy ra, không đặt quota hành vi.** Không có "post 3 ngày liên tiếp để nhận slot". Unlock ăn theo *memories* — thứ sinh ra khi hai người thật sự chơi với nhau.
2. **Reciprocity > volume.** Mọi tín hiệu tiến bộ đều cần hai chiều. Spam một chiều = 0.
3. **Progression là "của tụi mình", không phải "của tôi".** Level chính nằm ở từng cặp bạn bè; account level chỉ là hệ quả phụ.

**Hệ quả lớn: bỏ XP hoàn toàn, bỏ 50 missions.** Chỉ có một đơn vị duy nhất: **memory**. Một currency → user dễ hiểu, dev dễ build, kẻ xấu khó farm.

---

## 1. Đơn vị lõi: Memory

Định nghĩa cần chốt kỹ vì toàn bộ hệ thống xây trên nó:

> **1 memory (giữa A và B)** = trong một ngày, có ít nhất một tương tác hai chiều quanh một moment giữa hai người.

Luật đếm:

| Tình huống trong ngày | Memory |
|---|---|
| A đăng moment, B react | +1 (mức cơ bản) |
| Có reply / hội thoại hai chiều quanh moment | +1 |
| Cả hai cùng đăng moment và cùng phản hồi nhau | +1 |
| **Trần mỗi ngày mỗi cặp** | **3** |
| A nhắn 100 tin, B không trả lời | 0 |
| A react 50 moments của B, B không đáp lại gì | 0 |

- Trần 3/ngày chống binge-farm — ba memory thật trong một ngày đã là rất thân.
- Memory ghi vào events log **vĩnh viễn** → là nền của Timeline sau này.

---

## 2. V0.1 — MVP cho 1–3 dev (tuần 1–4)

Mục tiêu duy nhất: **chứng minh core loop giữ chân được người dùng khi chưa có gamification.** Nếu core yếu, không lớp progression nào cứu được.

### Core loop

```
Mở app → Camera → chụp moment → circle thấy (feed/widget/notification)
      → react / reply → hội thoại riêng tư → hôm sau lặp lại
```

### 5 màn hình, không hơn

1. **Camera** — màn hình mặc định khi mở app (như Locket). Một chạm để chụp, caption ngắn tùy chọn. Không filter cầu kỳ ở V0.1.
2. **Feed** — moments của circle, mới nhất trước, chỉ hiện 48h gần nhất. Không số like công khai, không comment công khai. React là riêng tư giữa hai người.
3. **Thread** — reply vào một moment mở hội thoại riêng 1-1, neo vào chính moment đó. Đây là "chat" của V0.1 — không cần build messenger đầy đủ.
4. **Circle** — grid 10 slot avatar (visual ○ ● như bản gốc). Add bạn qua link / QR / danh bạ.
5. **Profile & Settings** — tối thiểu: avatar, thông báo, block/remove, xóa tài khoản.

### Chạy ngầm nhưng bắt buộc có từ ngày 1: Events log

Bảng `events` append-only ghi mọi moment / react / reply. User chưa thấy gì cả — nhưng khi Timeline ship ở V0.2–0.3, mọi người nhận được **lịch sử đầy đủ hồi tố từ ngày đầu tiên**. Một "wow moment" miễn phí mà nếu không log từ đầu sẽ mất vĩnh viễn.

### Cắt khỏi V0.1

- XP ❌ (bỏ vĩnh viễn, xem mục 0)
- Missions ❌ (chỉ còn 5 bước onboarding ở V0.2)
- Account level, friendship level UI, streak hiển thị ❌
- Group, WhereAreYou, shared album ❌

### Một ngoại lệ đáng cân nhắc: Widget màn hình chính

Widget là cơ chế viral của Locket — mời bạn xong là mặt bạn hiện ngay trên home screen, payoff tức thì, giải trực tiếp bài toán cold start. **Nếu team đủ sức, widget xứng đáng một suất trong V0.1 hơn bất kỳ tính năng progression nào.** Không kịp thì đưa lên đầu V0.2.

### Data model gợi ý (Supabase / Firebase đều được)

```
users        (id, phone/apple_id, name, avatar)
friendships  (user_a, user_b, status: pending|active|dormant|blocked, created_at)
moments      (id, author_id, media_url, caption, created_at)
reactions    (moment_id, user_id, emoji, created_at)
messages     (moment_id, from_id, to_id, text, created_at)
events       (id, type, actor_id, target_user_id, ref_id, created_at)  ← bảng quan trọng nhất
memories     (pair_key, date, count)  ← job hằng ngày tính từ events
```

Mọi bảng phía trên đều bắn event vào `events`. `memories` chỉ là dẫn xuất — sai thì tính lại được, miễn `events` còn nguyên.

### Cold start (tử huyệt số 1 của app này)

- Circle trống → app không hiện feed rỗng buồn tẻ, mà hiện màn mời với preview mờ: *"Circle của bạn đang trống. Mời người đầu tiên."*
- Link mời cá nhân hóa: "Nhân đã chia sẻ 3 moments trong circle" + thumbnail blur (tạo tò mò, không lộ nội dung).
- Moment đăng khi chưa có bạn vẫn được lưu private → không mất dữ liệu, thành seed cho timeline sau này.
- **Launch theo cụm**: chọn 3–5 nhóm bạn thật (mỗi nhóm 4–8 người) và mời cả nhóm cùng lúc. Không launch công khai ở V0.1.

### Test 2 tuần — tiêu chí quyết định

| Metric | Ý nghĩa | Ngưỡng |
|---|---|---|
| Số cặp có ≥1 memory/tuần | **North star** — không phải DAU | Tăng dần qua 2 tuần |
| % moments có phản hồi trong 1h | Feed lạnh = chết | > 60% |
| % user vẫn tự đăng ở ngày 10–14 | Retention thật | ≥ 50% → build V0.2 |

Nếu dưới 30% user còn đăng ở tuần 2 → **sửa core loop, đừng đắp gamification lên một core yếu.**

---

## 3. Friendship Level 1–10 (ship từ V0.2)

Nguyên tắc hiển thị: level chỉ **hai người trong cặp nhìn thấy**. Không public, không leaderboard, không so sánh giữa các cặp — tránh "sao mình chỉ Lv3 với nó" (status anxiety là thứ phá cảm giác an toàn của app).

| Lv | Tên | Điều kiện | Unlock |
|---|---|---|---|
| 1 | Bắt đầu | Kết bạn | Moments, react, chat — **mọi giao tiếp cơ bản mở sẵn, không bao giờ bị khóa** |
| 2 | Quen | 7 memories | Nickname riêng cho nhau, bộ reaction tùy chỉnh |
| 3 | Thân dần | 20 + quen ≥ 2 tuần | 📔 **Shared Album** — album chung tự gom moments hai chiều |
| 4 | Gắn bó | 35 | 🕰️ **Timeline cơ bản** (mốc hồi tố từ ngày đầu) + doodle/voice lên moment của nhau |
| 5 | Thân | 60 + reciprocity ≥ 0.4 | 🗺️ **Shared Places** — ghim địa điểm kỷ niệm (không realtime) |
| 6 | Rất thân | 90 + cả hai opt-in | 📡 **Nearby** — chỉ khoảng cách, làm tròn 500m, cập nhật 15 phút |
| 7 | Thân thiết | 130 + quen ≥ 2 tháng | 📍 **WhereAreYou khu vực** — cấp quận/phường |
| 8 | Cực thân | 200 | 🟢 **Live session** 30–60 phút, mutual, tự tắt |
| 9 | Tri kỷ | 280 | 🎞️ **Friendship Recap** tháng/năm — xuất video/ảnh chia sẻ được |
| 10 | Inner Circle | 365 + quen ≥ 1 năm | 💎 Widget đôi, ngày kỷ niệm, Memory Book |

**Cảm nhận tốc độ** (bạn thân tương tác đều ~1 memory/ngày): Lv3 sau ~3 tuần, Lv5 sau ~2 tháng, Lv7 sau ~4 tháng, Lv10 sau ~1 năm. Location unlock **không thể** rush trong vài ngày dù cố — time gate chặn.

### Dormancy thay vì decay

Trả lời câu hỏi "level có tụt không": **không bao giờ trừ level.** Trừng phạt = áp lực = bài học Snapchat streak. Thay vào đó:

- Sau 30 ngày không có memory mới → cặp chuyển trạng thái **ngủ đông**: relationship ring chuyển xám, và **mọi quyền location tự động pause** (an toàn là lý do chính).
- Một memory mới → sáng lại như cũ, không mất gì.

Người dùng không bị phạt, nhưng quyền nhạy cảm không tồn tại mãi trên một mối quan hệ đã nguội.

---

## 4. Quality signals — chống farm & fake

1. **Định nghĩa memory tự nó chống spam**: tương tác một chiều = 0, dù lặp 100 lần.
2. **Daily cap 3/cặp**: binge 500 tin nhắn một tối = tối đa 3 memories.
3. **Reciprocity ratio** `r = min(A→B, B→A) / max(A→B, B→A)` tính trên 30 ngày gần nhất. Gate ở Lv5 trở lên (r ≥ 0.4): không ai "đơn phương nuôi" một friendship lên tới mức location.
4. **Time gates** ở Lv3 / 7 / 10: tài khoản mới tạo để farm không thể rush.
5. **Invite chỉ được tính khi người được mời sống thật**: có ≥ 3 memories với ít nhất 1 người trong 14 ngày đầu (đúng tinh thần bản ý tưởng gốc — tăng social graph thật, không tăng số account).
6. **Slot không bán, level không mua — vĩnh viễn.** Monetization đi đường khác (mục 6).
7. Velocity check phía server (bot detection) — chạy âm thầm, không hiện với user.

---

## 5. Account layer (bản lean) — slot mở bằng độ sâu, không bằng nhiệm vụ

- Bắt đầu: **10 slots**
- Mỗi friendship đạt **Lv2**: +1 slot (tối đa +15)
- Mỗi friendship đạt **Lv5**: +1 slot nữa (tối đa +10)
- Trần: **35 slots** — app là circle, không phải follower graph. Nới sau nếu data cho thấy cần.

Logic một câu: *"Muốn thêm bạn mới? Hãy thật sự chơi với những người bạn đang có."* Chống add-farm tự nhiên, không cần một mission nào.

### Journey onboarding — 5 bước, một lần duy nhất (V0.2)

Add 3 bạn → moment đầu tiên → react đầu tiên → reply đầu tiên → bật widget/notification. Xong → **không bao giờ còn nhiệm vụ nữa.**

Vì sao không phải 50 nhiệm vụ: 50 nhiệm vụ = 50 lời nhắc rằng "đây là game phải cày". 5 bước = hướng dẫn dùng app xong rồi biến mất. Mọi progression sau đó đến từ tình bạn diễn ra tự nhiên.

---

## 6. WhereAreYou — consent ladder

Bất biến ở **mọi** tầng:

- Mutual opt-in **theo từng cặp** — bật riêng cho từng người, không có công tắc "bật cho tất cả".
- Pause một chạm, không cần lý do. Tự pause khi cặp ngủ đông.
- Server **không lưu lịch sử vị trí** — chỉ vị trí hiện tại, TTL 15 phút.
- Fuzzy trước, exact chỉ tồn tại trong live session do cả hai chủ động mở.
- Không hiển thị tọa độ dạng số ở bất kỳ UI nào.

Ba tầng theo friendship level:

| Tầng | Level | Người kia thấy gì |
|---|---|---|
| Nearby | 6 | "Minh cách bạn ~1.2 km" — khoảng cách làm tròn 500m, cập nhật 15' |
| Khu vực | 7 | "Minh — Quận 1" |
| Live session | 8 | Vị trí trực tiếp trong 30/60 phút, đồng hồ đếm ngược hiện ở **cả hai** phía, hết giờ tự tắt |

Khi có bạn nearby → nút **"Let's meet"**: cầu nối từ digital social sang real-life social — đích đến thật của app.

---

## 7. Monetization — nghĩ sớm để không phá progression

**Không bao giờ bán:** friend slots, friendship level, memories. Bán slot/level là phá toàn bộ ý nghĩa của hệ thống.

Bán được mà hợp linh hồn app:

- **Cosmetics**: theme cho relationship ring, widget skin, khung moment.
- **Memory Book**: in photobook vật lý từ Friendship Timeline — quà sinh nhật / kỷ niệm ngày quen. Người ta sẵn sàng trả tiền cho kỷ niệm, không phải để "thắng".
- **Recap+ / backup gốc**: subscription nhẹ cho export chất lượng cao, recap video dài.

---

## 8. Roadmap

| Bản | Nội dung | Điều kiện đi tiếp |
|---|---|---|
| **V0.1** (tuần 1–4) | Core loop 5 màn hình + events log + widget nếu kịp | Test 2 tuần đạt ngưỡng mục 2 |
| **V0.2** | Memory engine hiện ra: friendship Lv1–4, Shared Album, Timeline hồi tố, Journey 5 bước, slot mechanic | Retention giữ vững, user hiểu memory |
| **V0.3** | Lv5–8: Shared Places, Nearby, WhereAreYou, Live session; group nhỏ nếu user đòi | Không sự cố privacy, opt-in rate tốt |
| **V0.4** | Lv9–10: Recap, Memory Book, gợi ý thông minh ("17 ngày chưa có memory với Minh — gửi một tấm?") | — |

---

## 9. Câu hỏi mở — chốt trước khi code

1. **Moments có hết hạn không?** Đề xuất: không xóa (timeline là tài sản dài hạn), nhưng feed chỉ hiển thị 48h gần nhất.
2. **Tên app + tên tiếng Việt cho "memory" trong UI?** ("khoảnh khắc"? "kỷ niệm"?) — chữ này xuất hiện khắp app, chọn kỹ.
3. **Nhóm seed đầu tiên là ai?** Lý tưởng: nhóm bạn thân của chính team — feedback nhanh và thật nhất.
4. **Widget vào V0.1 hay V0.2?** Quyết theo sức team, nhưng ưu tiên cao.
