# @nook/shared — hợp đồng giữa app và server

Chỉ chứa thứ mà **cả hai bên cùng cần**. Không có gì khác.

## Cách xếp: TẦNG ở ngoài, LOẠI ở giữa, MIỀN ở trong

```
src/
├── common/              KHÔNG thuộc bảng nào — xoá sạch Nook đi vẫn còn nghĩa
│   ├── constant/
│   │   ├── http/        error · message · route · status
│   │   └── realtime/    realtime.constant.ts
│   ├── interface/
│   │   ├── http/        envelope · cursor
│   │   └── record/      record.interface.ts
│   ├── type/
│   │   └── http/        response · status
│   ├── util/
│   │   └── http/        path.util.ts
│   └── index.ts
└── model/               nghiệp vụ Nook
    ├── constant/
    │   ├── auth/        auth · auth-error · auth-message
    │   ├── user/        user · user-error · user-message · username
    │   ├── circle/      circle · circle-error
    │   ├── media/       media.constant.ts
    │   ├── memory/      memory.constant.ts
    │   ├── achievement/ achievement.constant.ts
    │   └── catalog/     error · message · limit   ← bản gộp ERR · MSG · LIMITS
    ├── interface/
    │   ├── auth/  user/  circle/  media/  achievement/
    ├── type/
    │   ├── auth/  user/  media/  achievement/  catalog/
    ├── util/
    │   ├── auth/  user/  circle/  memory/
    └── index.ts
```

**Bốn loại đứng ngang cấp nhau, ở cả hai tầng.** Miền là thư mục con bên trong
loại — `interface/auth/`, `type/auth/`, `constant/auth/` — chứ không phải tầng
ngoài. Cây xếp theo **kiến trúc**, không theo miền.

Đặt một tệp mới chỉ còn **hai câu hỏi, theo thứ tự:**

1. **Xoá sạch Nook đi thì nó còn nghĩa không?** Vỏ câu trả lời, con trỏ lật
   trang, mã HTTP — còn nghĩa, nên `common/`. Mốc cấp thân, số chỗ trong góc,
   luật tên riêng — hết nghĩa, nên `model/`.
2. **Nó là loại gì?** `constant` · `interface` · `type` · `util`.

Mở `interface/` ra là thấy **đủ mọi hình dạng dữ liệu của hệ thống cạnh nhau**,
không phải mở bảy thư mục miền rồi ghép lại trong đầu.

### Ba luật của cây — `npm run check:layer` soi cả ba

**1. `common/` không được nhập từ `model/`.** Nó là tầng dưới. Chiều ngược lại
thoải mái.

**2. Cùng loại thì nhập THẲNG tệp; đổi loại thì đi qua `index.js` của loại.**

```ts
// constant -> constant: thang tep
import { AUTH_ERR } from '../auth/auth-error.constant.js';
// util -> constant: qua barrel cua loai
import { CIRCLE_LIMITS } from '../../constant/index.js';
```

Không phải làm cho đẹp. `constant/catalog/` gộp từ `constant/auth/`,
`constant/user/`… — đi qua `constant/index.js` là **nó tự nhập vào chính mình**,
và `{ ...AUTH_ERR }` sẽ chạy trúng lúc `AUTH_ERR` chưa có giá trị. Đổi loại thì
an toàn vì mấy đường đó đều là `import type`, biến mất lúc dịch.

**3. Barrel chỉ có ở tầng loại** — 11 cái `index.ts` cho 43 tệp thật. Đẻ thêm
barrel cho từng miền là thành `apis/` ngày xưa: 39 `index.ts` trên 84 tệp, tìm
code phải lội qua mấy tầng rỗng.

Bộ soi còn bắt ba thứ nữa: mở thư mục mới ở ngoài mà không phải một loại · tệp
nằm dưới `interface/` mà không đặt tên `*.interface.ts` · tệp mới quên treo lên
barrel của loại.

### Một thư mục là một BẢNG, không phải một cửa

`username` từng là miền riêng và đó là sai: nó là hai CỘT của bảng `users`,
không sống nổi khi người dùng bị xoá. Giờ nó tách theo **tệp** —
`constant/user/username.constant.ts` cạnh `constant/user/user.constant.ts` —
chứ không tách theo thư mục.

## `util/` — hàm dùng chung, KHÔNG phải bài toán thật

Đây là chỗ dễ phình nhất, nên luật phải rõ:

| ở đây được | ở đây KHÔNG được |
|---|---|
| hàm thuần, vài dòng, hai bên chạy ra **cùng một kết quả** | bộ kiểm thật (email, số điện thoại, quyền) |
| soi HÌNH DẠNG để app biết lúc nào sáng cái nút | thứ cần thư viện, cần cơ sở dữ liệu, cần bí mật |
| chuẩn hoá để hai bên so sánh giống nhau (`normalizeUsername`) | luật tính toán của sản phẩm |
| tra bảng hằng số công khai (`levelFromMemories`) | bất cứ thứ gì kẻ đọc `.apk` không nên biết |

**Bài toán thật thì backend tự code, bằng thư viện của backend.** `looksLikeEmail`
ở đây là để app biết lúc nào cho bấm nút — nó cho lọt `nam@b..com`, `nam@-.com`,
`nam..h@gmail.com`. Bộ kiểm thật là `isEmail` của `class-validator` và
`parsePhoneNumberFromString` của `libphonenumber-js`, cả hai nằm bên backend.

Chặn chặn của luật này không phải chú thích, mà là **`dependencies` rỗng**: gói
này không có thư viện nào thì không ai viết được bộ kiểm thật ở đây kể cả muốn.
`npm run check:layer` bắt ngay khi có người thêm một phụ thuộc.

Hai bên gọi cùng một hàm là ĐÚNG, miễn là **backend gọi lại nó chứ không tin
app đã gọi** — `checkUsernameShape` chạy ở cả hai bên đúng như vậy: app gọi để
khỏi tốn vòng mạng, server gọi lại vì app nói gì cũng không tin được, rồi server
làm thêm phần app không làm được (hỏi cơ sở dữ liệu xem tên có ai lấy chưa).

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

Mã lỗi **sống ở miền của nó** (`model/constant/auth/auth-error.constant.ts`, …).
`constant/catalog/` chỉ ghép lại thành một bảng duy nhất để tra cho tiện:

```ts
export const ERR = { ...COMMON_ERR, ...AUTH_ERR, ...USER_ERR, ...CIRCLE_ERR } as const;
export type TErrCode = (typeof ERR)[keyof typeof ERR];
```

Có **chốt biên dịch** bắt trùng khoá: hai miền đặt trùng tên là bảng sau đè bảng
trước, im lặng — nên khoá của từng miền mang sẵn tiền tố (`USER_NOT_FOUND`,
`CIRCLE_FULL`), và nếu vẫn trùng thì `tsc` đỏ ngay tại dòng chốt.

**Vì sao `catalog` nằm ở `model/` chứ không ở `common/`,** dù ai cũng dùng nó:
nó nhập từ mọi miền, nên để bên `common/` là bắt tầng dưới nhập lên tầng trên.
Xếp thư mục theo thứ nó PHỤ THUỘC vào, không theo ai gọi nó.

`catalog` cũng là lý do `model/constant/index.ts` **xuất nó ở dòng cuối**: bản
gộp phải chạy sau thứ nó gộp.

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

// Hoặc lấy đúng tầng + loại cần. Đường nhập ĐÚNG BẰNG đường thư mục.
import { API, HTTP_STATUS } from '@nook/shared/common/constant';
import type { IApiEnvelope } from '@nook/shared/common/interface';
import { AUTH_ERR, ERR } from '@nook/shared/model/constant';
import { circleCapacity } from '@nook/shared/model/util';
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

`exports` đã khai từng tầng + loại, nên `@nook/shared/model/constant` chạy ngay sau khi
publish. Khi nào muốn publish thật: bỏ `"private": true`, đổi `"name"` sang
scope có thật, rồi `npm publish` — `prepublishOnly` tự dọn và dựng lại `dist/`.

Gói này là **ESM**. Node từ 22.12 trở lên `require()` được ESM nên bên dùng
CommonJS vẫn xài được; Node cũ hơn thì không.
