# Nook — Dùng được khi không có mạng

Ghi trước khi code, để lúc code làm một hơi. Chưa có dòng mã nào theo tài liệu này.

Đọc kèm: [`01-product-system.md`](01-product-system.md) mục 0 và mục 2.

---

## 0. Vì sao app này bắt buộc phải chạy được khi mất mạng

Không phải để "cho sang". Ba lý do nằm ngay trong sản phẩm:

1. **Chức năng số một là chụp ảnh.** Người ta chụp lúc leo núi, trong hầm gửi xe,
   ở quán không Wi-Fi. App chặn không cho chụp vì mất sóng là app hỏng, không
   phải app thiếu tính năng.
2. **Feed chỉ hiện 48 giờ và góc tối đa 10 người.** Lượng dữ liệu cần giữ ở máy
   nhỏ và **có trần tự nhiên** — đây là món quà, không phải bài toán khó. App
   nào feed vô tận mới không làm nổi chuyện này.
3. **Ảnh nặng.** Đằng nào cũng phải giữ lại ở máy để khỏi tải hai lần. Đã giữ
   rồi thì việc xem được lúc mất mạng gần như miễn phí.

Câu chốt: **mất mạng thì app mất khả năng biết chuyện MỚI, chứ không mất những
gì đã có.**

---

## 1. "Mất mạng" không phải một trạng thái — nó có sáu

Đây là chỗ hay sai nhất. Coi nó là bật/tắt là hỏng.

| Cảnh | Máy nghĩ gì | Cái đau |
|---|---|---|
| Mạng tốt | có mạng | — |
| **Mạng chậm** (1 vạch) | có mạng | **Đau hơn mất hẳn.** Lệnh gọi treo chứ không hỏng, người dùng ngồi nhìn vòng xoay. Phải có hạn chờ, hết hạn thì xử như mất mạng. |
| **Wi-Fi quán cà phê chưa đăng nhập** | **có mạng** | Máy báo đã nối, mà mọi lệnh gọi trả về trang đăng nhập của quán. Phải soi *có ra được internet không*, đừng tin mỗi *có nối Wi-Fi không*. |
| Mất hẳn | không mạng | dễ xử nhất |
| **Chập chờn** (đi xe, vào hầm) | đổi liên tục | Bắn lại ngay mỗi lần thấy có mạng là tự đánh sập chính mình. Phải có nhịp lùi dần. |
| **Mạng tốt, server chết** | có mạng | Khác hẳn mất mạng: không được xếp hàng chờ vô hạn, và câu nói với người dùng cũng khác. |

**Luật:** phân biệt ba nhóm — *máy không ra được internet* · *server không trả lời*
· *server trả lời là hỏng*. Ba nhóm ba cách xử, đừng gộp.

---

## 2. Đọc — cái gì vẫn xem được

| Thứ | Offline | Ghi chú |
|---|---|---|
| Feed 48h, ảnh đã tải | **có, đầy đủ** | đây là phần cốt lõi |
| Ảnh chưa kịp tải | không | phải hiện ô mờ và cho biết *chưa tải*, đừng để trông như ảnh hỏng |
| Thread, tin nhắn cũ | **có** | chữ rất nhẹ, giữ hết |
| Góc bạn bè (10 người, tên, avatar) | **có** | vài chục KB |
| Hồ sơ của mình | **có** | |
| Cấp thân với từng người | **có**, bản chụp lần cuối | không hiện như số liệu tức thời |
| Thành tích, số chỗ trong góc | **có**, bản chụp | |
| Trung tâm thông báo | **có**, phần đã kéo về | |
| Ảnh gốc chất lượng cao | chỉ cái đã chủ động tải | không ôm hết được |
| Tìm người, kiểm tên riêng còn trống | không | vốn dĩ phải hỏi server |
| Đăng nhập, xin mã | không | |

Nguyên tắc dựng màn: **màn nào cũng phải vẽ được từ dữ liệu ở máy trước, rồi mới
đắp dữ liệu mới lên.** Không màn nào được bắt đầu bằng vòng xoay chờ mạng.

### Giữ sẵn bao nhiêu, và lên mạng thì kéo gì

App **không đợi có mạng mới tải**. Nó giữ sẵn một số bài ở máy, và biết mình
đang giữ tới đâu. Có mạng thì chỉ kéo **phần mới hơn** chồng lên đầu, không kéo
lại từ đầu.

- Mở app → vẽ ngay từ cái đang có, không vòng xoay.
- Có mạng → hỏi *"có gì mới hơn chỗ tôi đang giữ không"* (xem 4.4) → chèn lên đầu.
- Ảnh của bài mới tải ngầm, xong tấm nào hiện tấm đó.

Giữ sẵn bao nhiêu thì hợp: **feed 48 giờ đã là trần tự nhiên**, thường chỉ vài
chục bài với góc 10 người. Cứ giữ trọn 48 giờ, cộng thêm bản `thumb` của lứa cũ
hơn để cuộn xuống không bị trống. Không cần đặt con số cứng — trần thời gian
làm hộ việc đó rồi.

---

## 3. Ghi — cái gì xếp hàng được

| Việc | Xếp hàng | Bẫy phải xử |
|---|---|---|
| **Chụp và đăng khoảnh khắc** | **bắt buộc được** | ảnh nằm ở máy, gửi sau. Hiện ngay trong feed với dấu "đang chờ" |
| Thả tim / gỡ tim | được | thả-gỡ-thả ba lần = **một** việc cuối cùng, không phải ba |
| Nhắn trong thread | được | phải giữ **đúng thứ tự** trong cùng một thread |
| Sửa hồ sơ, đổi avatar | được | |
| **Đặt tên riêng** | được, nhưng | tên riêng là duy nhất — offline không kiểm được, lên mạng có thể đã có người lấy → phải báo và mời chọn lại, đừng nuốt |
| Mời bạn / nhận lời mời | được, dè chừng | bên kia có thể đã rút lời mời trong lúc mình offline |
| Chặn / bỏ bạn | được | **và phải huỷ mọi việc đang xếp hàng cho người đó** |
| Đăng nhập, xin mã | không | vô nghĩa |
| **Xoá tài khoản** | **không** | không xếp hàng việc không lấy lại được |

---

## 4. Năm chỗ khó — nghĩ kỹ trước khi code

### 4.1 Thẻ ngắn hạn hết hạn trong lúc offline → **không được đá về màn đăng nhập**

Trên điện thoại, người ta đăng nhập **một lần rồi thôi**. Đó là kỳ vọng, và hệ
thống phải chiều đúng nó.

Cách làm: thẻ ngắn hạn sống 15 phút (`JWT_ACCESS_TTL=900`), thẻ dài hạn
**180 ngày** (`JWT_REFRESH_TTL=15552000`) — nhưng con số 180 ngày đọc là
**"bao lâu KHÔNG mở app"**, không phải "bao lâu thì bị đá ra". Mỗi lần app làm
mới thẻ, hạn đẩy ra xa lại từ đầu. Nên người dùng thật, mở app dù chỉ vài tháng
một lần, **không bao giờ phải gõ lại mã**.

Chỗ gia hạn nằm ở `reissue()` trong `session.service.ts`, và có ca kiểm giữ nó
trong `smoke-auth.sh` — bỏ dòng đó đi là 180 ngày biến thành hạn tử.

Còn chuyện offline: người ta lên máy bay, ba tiếng sau mở app. Thẻ ngắn hạn
chết, mà chưa gọi được server để đổi thẻ mới.

**Đây là lỗi kinh điển và nó phá app:** đá về màn đăng nhập là người dùng mất
sạch những gì đã tải, giữa lúc không có mạng để đăng nhập lại.

Luật:

- Thẻ ngắn hạn hết hạn mà **chưa hỏi được server** → coi như vẫn đăng nhập,
  cho xem hết dữ liệu ở máy, chỉ chặn những việc phải có server.
- Chỉ đăng xuất khi **server trả lời rõ ràng** là `auth.session_revoked` /
  `auth.unauthorized`. Không trả lời được thì không kết luận gì cả.
- Lên mạng lại, hai chục lệnh gọi đang chờ cùng nhận 401 một lúc →
  **chỉ một lệnh đổi thẻ được chạy**, số còn lại xếp hàng chờ kết quả của nó.
  Không làm vậy là hai chục lệnh cùng xoay thẻ, và cơ chế chống chép thẻ sẽ
  hiểu nhầm là thẻ bị đánh cắp rồi **thu hồi sạch phiên**. Server đã có khoảng
  ân hạn 30 giây đỡ bớt, nhưng đó là lưới an toàn, không phải giấy phép.

### 4.2 Ảnh — giữ bản nào, xoá bản nào trước

Luật cứng của dự án: **không bao giờ bóp phân giải ảnh gốc.** Nhưng cũng không
thể ôm bản gốc của cả feed trên điện thoại.

Đã có sẵn hai bản nhẹ ở server (`MEDIA_VARIANTS = ['feed', 'thumb']`, dạng webp).
Dùng đúng chỗ:

- lướt feed → bản `feed`
- ô vuông nhỏ, góc bạn bè → bản `thumb`
- mở to / lưu về máy → **bản gốc**, và chỉ lúc đó mới tải

Kho ở máy có trần dung lượng và luật dọn — nhưng luật dọn có **một ngoại lệ tuyệt
đối**:

> **Ảnh đang chờ gửi không bao giờ bị dọn.**

Ảnh đã gửi rồi thì xoá ở máy vẫn tải lại được từ server. Ảnh **chưa gửi** thì bản
duy nhất trên đời nằm ở máy đó — dọn nhầm là mất vĩnh viễn. Nó phải nằm ngoài
mọi phép tính dung lượng, kể cả khi máy gần đầy.

Chuyện liên quan: **máy hết chỗ**. Phải báo ngay lúc bấm chụp, không phải lúc gửi
— báo lúc gửi là người ta đã đi khỏi khoảnh khắc đó rồi.

### 4.3 Hàng đợi gửi — gửi hai lần không được đẻ hai bản

Mạng chậm rồi hết hạn chờ: app **không biết** server đã nhận hay chưa. Gửi lại là
chuyện bắt buộc, nên phải gửi lại được mà không sinh bản trùng.

Cách: mỗi việc mang một **mã do máy tự sinh** (`clientId`, uuid). Server nhận
thấy mã đã xử lý rồi thì trả về **đúng kết quả cũ**, không tạo cái mới.

Đây là việc của backend, phải làm ngay từ lúc dựng đường ghi đầu tiên — nhét vào
sau là phải đi sửa cả app lẫn server.

Còn lại:

- Thread giữ thứ tự; feed thì không cần.
- Lùi dần khi hỏng (1s, 2s, 4s…, trần 5 phút), đừng bắn dồn.
- **Hỏng vĩnh viễn thì rơi khỏi hàng đợi và phải nói ra.** Ví dụ tên riêng đã có
  người lấy, hoặc đã bị người kia chặn. Im lặng thử lại mãi là tệ nhất: người
  dùng tưởng đã gửi.
- Hàng đợi phải sống qua việc tắt app và khởi động lại máy.

### 4.4 Lên mạng lại — kéo cái gì

Không kéo lại từ đầu. Cần **một cửa duy nhất**:

```
GET /v1/sync?cursor=<con trỏ lần trước>
```

trả về mọi thứ đã đổi kể từ đó: khoảnh khắc mới, tim mới, tin nhắn mới, thay đổi
trong góc bạn bè, thông báo — kèm `nextCursor` cho lần sau.

Hai điều quan trọng:

- **Con trỏ do server phát, không dùng đồng hồ của máy.** Đồng hồ điện thoại
  lệch, và người dùng chỉnh tay được.
- Cửa này **dùng chung với trung tâm thông báo**. Cùng một nguồn — nếu tách
  thành hai đường thì sớm muộn hai bên lệch nhau.

Đi kèm: cần **ký một lượt nhiều đường ảnh** thay vì mỗi ảnh một lần chuyển hướng
như hiện nay. Vừa lên mạng mà bắn 40 lệnh gọi lẻ là chậm và tốn pin.

### 4.5 Đụng độ

May là dữ liệu app này gần như chỉ thêm chứ không sửa, nên ít. Bốn ca thật:

| Ca | Xử |
|---|---|
| Sửa hồ sơ ở hai máy | cái ghi sau thắng — đủ, đừng làm phức tạp |
| Thả rồi gỡ tim ở hai máy | theo mốc thời gian của **server** |
| Tên riêng bị người khác lấy mất | báo, mời chọn lại — xem 4.3 |
| Bị chặn / bị bỏ bạn lúc đang offline | huỷ sạch việc xếp hàng cho người đó, đừng gửi |

---

## 5. Nói với người dùng thế nào

Ba từ cấm (*điểm*, *hạng*, *nhiệm vụ*) và **không chữ kỹ thuật** — luật này áp
nguyên vào đây, mà chỗ này là chỗ dễ phạm nhất.

| Chuyện | Nói | Đừng nói |
|---|---|---|
| Đang mất mạng | thanh mảnh trên đầu: "Đang chờ mạng" | popup chặn màn hình |
| Ảnh chưa gửi được | ngay trên ảnh đó: "Sẽ tự gửi lại" | "Sync failed", "Retry queue" |
| Dữ liệu cũ | dấu hiệu nhẹ, đừng giả vờ là mới | "Cache stale" |
| Server chết | "Chưa vào được, thử lại sau" | mã lỗi, số 500 |
| Tên riêng vừa bị lấy mất | "Tên này vừa có người dùng, chọn tên khác nhé" | "409 Conflict" |

Và: **ảnh vừa chụp phải hiện trong feed ngay lập tức**, kèm dấu đang chờ. Không
được giấu tới lúc gửi xong. Người ta cần thấy việc mình vừa làm.

---

## 6. Backend phải chuẩn bị gì

Việc rơi về phía server, xếp theo thứ tự cần:

1. **`clientId` chống trùng** trên mọi đường ghi (khoảnh khắc, tim, tin nhắn) —
   phải có **ngay từ đường ghi đầu tiên**, thêm sau là đau.
2. **`GET /v1/sync?cursor=`** — một cửa cho mọi thay đổi, dùng chung với thông báo.
3. **Ký một lượt nhiều đường ảnh** thay cho từng cái một.
4. **Trả kèm giờ của server** để app khỏi tin đồng hồ của chính nó.
5. Bản nhẹ `feed` / `thumb` — **đã có rồi**.
6. Khoảng ân hạn khi xoay thẻ — **đã có rồi** (30 giây).

---

## 7. Chờ chốt

1. **Offline quá 48 giờ rồi mở app** — feed vốn chỉ hiện 48h. Xoá cho đúng luật,
   hay cứ hiện cái đã tải? *Nghiêng về: cứ hiện* — thà thấy cũ còn hơn màn hình
   trống, và moment không bị xoá ở server.
2. **Trần dung lượng ảnh ở máy là bao nhiêu** — 300MB? 500MB? Cho người dùng
   chỉnh trong Cài đặt không?
3. **Việc xếp hàng để bao lâu thì bỏ** — ảnh chụp một tuần trước chưa gửi được,
   còn gửi nữa không, hay hỏi lại người dùng?
4. **Bấm đăng xuất lúc không có mạng** — xoá dữ liệu ở máy ngay (đúng về riêng
   tư, nhưng chưa thu hồi được thẻ), hay chặn không cho tới khi có mạng?
   *Nghiêng về: xoá ngay, thu hồi thẻ sau* — điện thoại đang cầm trong tay quan
   trọng hơn cái thẻ trên server.
