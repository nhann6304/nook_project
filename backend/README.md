# Nook — backend

**Chưa bắt đầu.** Thư mục này là chỗ đã dành sẵn, để mã server không bị đổ lẫn
vào app.

---

## Ranh giới với frontend — đọc trước khi viết dòng đầu tiên

**Màn hình không biết server tồn tại.** Mọi lệnh gọi mạng của app nằm gọn trong

```
frontend/src/features/<tên>/lib/*Api.ts
```

Hiện có đúng một file như vậy: `frontend/src/features/auth/lib/authApi.ts`, và
nó là **hàng giả** — trả kết quả sau 700 mili giây, mã đúng là `123456`:

```ts
export async function sendCode(method, target): Promise<SendResult>
export async function verifyCode(code): Promise<VerifyResult>
```

Khi backend có thật, **chỉ ruột hai hàm đó đổi**. Không một màn hình nào phải
sửa một dòng. Nếu thấy mình đang phải sửa file trong `frontend/src/features/*/screens/`
để nối server — dừng lại, ranh giới đang bị cắt qua.

## Dự kiến có gì

| Thư mục | Nội dung |
|---|---|
| `docs/` | `01-data-model` · `02-api` · `03-auth` · `04-media` · `05-push` |
| *(mã nguồn)* | Chưa chọn nền. Tài liệu cũ ghi hướng **Supabase**; chưa khởi tạo project, chưa có schema |

Việc đầu tiên phải làm rõ, theo thứ tự:

1. **Đăng nhập** — gửi mã 6 số qua email và SMS, kiểm mã, phát thẻ phiên.
   Frontend đã xong toàn bộ phần giao diện cho luồng này.
2. **Ảnh** — tải lên, cắt cỡ, và một đường dẫn ảnh **nhẹ riêng cho widget**
   (widget không tải được ảnh lớn).
3. **Góc 10 người** — mời, chấp nhận, và luật chặn góc thứ 11.
4. **Ký ức** — đơn vị tiến trình duy nhất. Luật ở
   [`../.docs/01-product-system.md`](../.docs/01-product-system.md) mục 3.
   Cần bảng `events` chỉ ghi thêm, không sửa: mọi cấp thân phải tính lại được
   từ lịch sử, không được lưu thành con số rồi cộng dần.
5. **Thông báo đẩy** — và cú đẩy làm widget tự tải lại.

## Luật sản phẩm mà backend phải giữ

Đọc [`../.docs/01-product-system.md`](../.docs/01-product-system.md) trước khi
thiết kế bảng. Ba luật ảnh hưởng thẳng tới lược đồ dữ liệu:

- **Cấp thân chỉ hai người trong cặp nhìn thấy.** Không có API nào trả cấp thân
  của người khác cho người thứ ba.
- **Không có bảng xếp hạng, không có số like công khai.** Đừng dựng bảng tổng
  để rồi lộ ra ở một endpoint nào đó.
- **Chống farm.** Ký ức tính theo tương tác **hai chiều** thật, có trần theo
  ngày. Xem mục 5 của tài liệu sản phẩm.
