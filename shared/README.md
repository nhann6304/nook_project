# @nook/shared — hợp đồng giữa app và server

Chỉ chứa thứ mà **cả hai bên cùng cần**. Không có gì khác.

## Cách xếp: miền ở ngoài, loại ở trong

```
src/
├── http/          đường dẫn API · mã HTTP · vỏ câu trả lời · lật trang
├── auth/          đăng nhập, mã 6 số, thẻ phiên
├── user/          hồ sơ
├── circle/        góc bạn bè, sức chứa, mốc cấp thân
├── achievement/   thành tích và con đếm
├── memory/        ký ức: trần theo ngày, khoá ngày theo giờ người dùng
├── realtime/      tên đường và tên sự kiện của ống socket
├── record/        mảnh chung của mọi bản ghi
├── catalog/       gộp mảnh từ các miền: ERR · MSG · LIMITS
└── index.ts
```

Trong **mỗi miền**, chia tiếp theo loại:

```
auth/
├── constant/    auth.constant.ts · auth-error.constant.ts · auth-message.constant.ts
├── interface/   auth.interface.ts
├── type/        auth.type.ts
├── util/        auth.util.ts
└── index.ts
```

Không tệp nào nằm lung tung: **loại nào vào thư mục nấy**, và tên tệp nói ra
loại của nó — `user.interface.ts`, `auth.type.ts`, `circle.constant.ts`,
`memory.util.ts`. Mỗi thư mục có `index.ts` gom lại.

**Vì sao miền ở ngoài chứ không phải loại.** Xếp loại ở ngoài thì một tính năng
nằm rải khắp nơi và **không tách ra được**. Ngày nào `circle` cần thành gói
riêng thì với cách này chỉ việc bê nguyên thư mục đi — nó đã mang sẵn hằng số,
kiểu, mã lỗi và hàm của nó.

## `interface` hay `type` — và tiền tố `I` / `T`

**Đây là quy định, không phải gợi ý.**

| | Dùng khi | Tiền tố | Ví dụ |
|---|---|---|---|
| `interface` | tả MỘT hình dạng dữ liệu | **`I`** | `IUserProfile`, `IAuthTokens`, `ISendCodeBody` |
| `type` | ghép hoặc suy ra từ hình dạng có sẵn | **`T`** | `TApiResponse`, `TSignInMethod`, `TErrCode` |

Ranh giới thật sự nằm ở chỗ **cái nào làm được việc gì**:

```ts
// Tả một hình dạng -> interface
export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}

// Hợp hai hình dạng -> interface KHÔNG làm được, phải là type
export type TApiResponse<T> = IApiEnvelope<T> | IApiError;

// Suy ra từ một hằng số -> cũng phải là type
export type TSignInMethod = (typeof SIGNIN_METHODS)[number];
```

Nhìn tên là biết ngay nó thuộc loại nào và nằm ở thư mục nào — không phải mở
tệp ra xem.

## `catalog/` — tách rồi lại gộp

Mã lỗi **sống ở miền của nó** (`auth/constant/auth-error.constant.ts`, …).
`catalog/` chỉ ghép lại thành một bảng duy nhất để tra cho tiện:

```ts
export const ERR = { ...COMMON_ERR, ...AUTH_ERR, ...USER_ERR, ...CIRCLE_ERR } as const;
export type TErrCode = (typeof ERR)[keyof typeof ERR];
```

Có **chốt biên dịch** bắt trùng khoá: hai miền đặt trùng tên là bảng sau đè bảng
trước, im lặng — nên khoá của từng miền mang sẵn tiền tố (`USER_NOT_FOUND`,
`CIRCLE_FULL`), và nếu vẫn trùng thì `tsc` đỏ ngay tại dòng chốt.

## Ba luật

**1. Không phụ thuộc.** `dependencies` phải luôn **rỗng**. Gói này bị nhét vào
bản app trên điện thoại — thêm một thư viện ở đây là thêm dung lượng cho hàng
chục nghìn máy. Cần `zod`, cần `libphonenumber-js`? Đó là chuyện riêng của
backend.

**2. Không bí mật, không luật tính toán.** Người ta mở được file `.apk` ra đọc.
Ở đây chỉ có **mốc** (`LEVEL_MEMORIES`), còn **cách tính** nằm ở server.

**3. Type là type, không phải bộ kiểm.** Type biến mất lúc chạy. Backend kiểm
đầu vào bằng `class-validator`, và buộc DTO khớp bằng `implements`:

```ts
export class SendCodeDto implements ISendCodeBody {
  @IsIn(SIGNIN_METHODS) method!: TSignInMethod;
  @IsString() @MinLength(3) target!: string;
}
```

Sửa `ISendCodeBody` mà quên sửa DTO → **backend không biên dịch được**. Đó là
điểm của cả gói này. Chiều ra thì dùng `satisfies`.

## Dùng

```ts
// Lấy hết
import { API, ERR, LIMITS, type IUserProfile } from '@nook/shared';

// Hoặc lấy đúng miền cần — nói rõ chỗ này phụ thuộc vào cái gì
import { API, HTTP_STATUS } from '@nook/shared/http';
import { AUTH_ERR, type ITokenClaims } from '@nook/shared/auth';
```

## Gói này phải được dịch trước backend

`@nook/shared` xuất ra **bản dịch** (`dist/`), mà `dist/` không nằm trong git.
Nên sau mỗi lần `git pull` thì bản dịch trên máy bạn là bản CŨ, và backend sẽ
báo lỗi vào những dòng hoàn toàn đúng — kiểu "`jti` does not exist in type
`ITokenClaims`" trong khi `jti` nằm sờ sờ ở nguồn.

Không phải nhớ mà gõ lệnh: `backend/package.json` có `predev`, `prebuild`,
`pretypecheck`, `pretest` cùng chạy `tsc -p ../shared/tsconfig.json` trước. Mọi
đường vào trình biên dịch đều đi qua đó.

Đang sửa nhiều ở gói này thì mở thêm một cửa sổ cho nhanh:

```bash
npm run dev -w @nook/shared     # tsc --watch
```

## Đưa lên npm sau này

`exports` đã khai từng miền, nên `@nook/shared/auth` chạy được ngay sau khi
publish. Khi nào muốn publish thật: bỏ `"private": true`, đổi `"name"` sang
scope có thật, rồi `npm publish` — `prepublishOnly` tự dọn và dựng lại `dist/`.

Gói này là **ESM**. Node từ 22.12 trở lên `require()` được ESM nên bên dùng
CommonJS vẫn xài được; Node cũ hơn thì không.
