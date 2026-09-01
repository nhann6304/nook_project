# @nook/shared — hợp đồng giữa app và server

Chỗ này chỉ chứa **thứ mà CẢ HAI bên cùng cần**. Không có gì khác.

```
src/
├── constant/   đường dẫn API · mã lỗi · giới hạn · mốc cấp · tên sự kiện socket
├── type/       hình dạng dữ liệu đi qua dây (body gửi lên, kết quả trả về)
└── util/       hàm thuần, không phụ thuộc, hai bên dùng y hệt nhau
```

## Ba luật

**1. Không phụ thuộc.** `dependencies` phải luôn **rỗng**. Gói này bị nhét vào
bản app trên điện thoại — thêm một thư viện ở đây là thêm dung lượng cho hàng
chục nghìn máy. Cần `zod`, cần `libphonenumber-js`? Đó là chuyện riêng của
backend, cài bên backend.

**2. Không có bí mật, không có luật tính toán.** Không khoá, không chuỗi kết
nối, không hàm tính cấp thân. Người ta mở được file `.apk` ra đọc. Ở đây chỉ có
**mốc** (`LEVEL_MEMORIES`), còn **cách tính** nằm ở server.

**3. Type là type, không phải bộ kiểm.** Type biến mất lúc chạy. Backend kiểm
đầu vào bằng `class-validator`, và buộc DTO phải khớp type bằng `implements`:

```ts
export class SendCodeDto implements SendCodeBody {
  @IsIn(['email', 'phone']) method!: SignInMethod;
  @IsString() @MinLength(3)  target!: string;
}
```

Sửa `SendCodeBody` ở đây mà quên sửa DTO → **backend không biên dịch được**.
Đó là điểm của cả gói này.

Chiều ra dùng `satisfies`:

```ts
return { accessToken, refreshToken, isNew, user } satisfies VerifyCodeResult;
```

## Vì sao có bước build

Nói thật: bản thiết kế trước ghi "không cần bước build". Sai. NestJS + TypeORM
bắt buộc `emitDecoratorMetadata`, mà `tsx`/esbuild không sinh được nó — nên
backend phải chạy qua `tsc`, và `tsc` không chịu biên dịch file nằm ngoài
`rootDir` của nó. Một lệnh `tsc` cho gói này là cách gọn nhất để hết chuyện.

Đang sửa nhiều ở đây thì mở thêm một cửa sổ: `npm run dev -w @nook/shared`.
