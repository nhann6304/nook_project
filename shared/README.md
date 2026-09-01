# @nook/shared — hợp đồng giữa app và server

Chỉ chứa thứ mà **cả hai bên cùng cần**. Không có gì khác.

## Xếp theo MIỀN, không theo loại tệp

```
src/
├── http/          hợp đồng vận chuyển: đường dẫn API, mã HTTP, vỏ câu trả lời, lật trang
├── auth/          đăng nhập, mã 6 số, thẻ phiên
├── user/          hồ sơ
├── circle/        góc bạn bè, sức chứa, mốc cấp thân
├── achievement/   thành tích và con đếm
├── memory/        ký ức: trần theo ngày, khoá ngày theo giờ người dùng
├── realtime/      tên đường và tên sự kiện của ống socket
├── catalog/       gộp mảnh từ các miền: ERR · MSG · LIMITS
└── index.ts
```

**Vì sao không phải `constant/ type/ util/`.** Xếp theo loại tệp thì một tính
năng nằm rải ở ba thư mục, và **không tách ra được**. Ngày nào `circle` cần
thành gói riêng thì với cách này chỉ việc bê nguyên thư mục đi — nó đã mang sẵn
hằng số, kiểu, mã lỗi và hàm của nó. Với cách cũ thì phải bóc từng dòng ra khỏi
năm tệp chung, và chắc chắn sót.

Trong mỗi miền, **loại nằm ở tên tệp**:

| Tệp | Chứa gì |
|---|---|
| `<miền>.constant.ts` | hằng số, giới hạn, danh sách |
| `<miền>.type.ts` | interface đi qua dây |
| `<miền>.util.ts` | hàm thuần |
| `<miền>.error.ts` | mã lỗi của miền |
| `<miền>.message.ts` | mã thông báo của miền |
| `index.ts` | gom lại |

Không tệp nào nằm lung tung ở gốc `src/` ngoài `index.ts`.

## `catalog/` — tách rồi lại gộp

Mã lỗi **sống ở miền của nó**. `catalog/` chỉ ghép lại thành một bảng duy nhất
để tra cho tiện, và để kiểu `ErrCode` bao được hết:

```ts
export const ERR = { ...COMMON_ERR, ...AUTH_ERR, ...USER_ERR, ...CIRCLE_ERR } as const;
export type ErrCode = (typeof ERR)[keyof typeof ERR];
```

`MSG` và `LIMITS` cũng vậy. Nhờ đó `ERR.CODE_EXPIRED` vẫn dùng được như cũ,
mà mã vẫn ở đúng chỗ nó thuộc về.

## Ba luật

**1. Không phụ thuộc.** `dependencies` phải luôn **rỗng**. Gói này bị nhét vào
bản app trên điện thoại — thêm một thư viện ở đây là thêm dung lượng cho hàng
chục nghìn máy. Cần `zod`, cần `libphonenumber-js`? Đó là chuyện riêng của
backend, cài bên backend.

**2. Không bí mật, không luật tính toán.** Không khoá, không chuỗi kết nối,
không hàm tính cấp thân. Người ta mở được file `.apk` ra đọc. Ở đây chỉ có
**mốc** (`LEVEL_MEMORIES`), còn **cách tính** nằm ở server.

**3. Type là type, không phải bộ kiểm.** Type biến mất lúc chạy. Backend kiểm
đầu vào bằng `class-validator`, và buộc DTO phải khớp type bằng `implements`:

```ts
export class SendCodeDto implements SendCodeBody {
  @IsIn(SIGNIN_METHODS) method!: SignInMethod;
  @IsString() @MinLength(3) target!: string;
}
```

Sửa `SendCodeBody` mà quên sửa DTO → **backend không biên dịch được**. Đó là
điểm của cả gói này. Chiều ra thì dùng `satisfies`.

## Dùng

```ts
// Lấy hết
import { API, ERR, LIMITS, type UserProfile } from '@nook/shared';

// Hoặc lấy đúng miền cần — nhẹ hơn, và nói rõ chỗ này phụ thuộc vào cái gì
import { API, HTTP_STATUS } from '@nook/shared/http';
import { AUTH_ERR, type TokenClaims } from '@nook/shared/auth';
```

## Đưa lên npm sau này

Cấu trúc đã sẵn sàng. `exports` trong `package.json` khai từng miền một, nên
`@nook/shared/auth` chạy được ngay sau khi publish, không phải sửa gì.

Khi nào muốn publish thật:

1. Bỏ dòng `"private": true`.
2. Đổi `"name"` sang scope có thật của bạn (`@ten-cua-ban/nook-shared`).
3. `npm publish` — `prepublishOnly` tự dọn và dựng lại `dist/` trước.

Hai điều cần biết trước:

- Gói này là **ESM**. Node từ 22.12 trở lên `require()` được ESM nên bên dùng
  CommonJS vẫn xài được; Node cũ hơn thì không.
- `files: ["dist"]` — chỉ mã đã dịch đi lên npm, không có `src/`.

## Vì sao có bước build

NestJS + TypeORM bắt buộc `emitDecoratorMetadata`, mà `tsx`/esbuild không sinh
được nó — nên backend phải chạy qua `tsc`, và `tsc` không chịu biên dịch tệp
nằm ngoài `rootDir` của nó. Một lệnh `tsc` cho gói này là cách gọn nhất để hết
chuyện. Đang sửa nhiều ở đây thì mở thêm một cửa sổ:
`npm run dev -w @nook/shared`.
