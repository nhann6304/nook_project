import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC = 'nook:isPublic';

/**
 * Mở một đường cho người chưa đăng nhập.
 *
 * Mặc định là NGƯỢC LẠI: cổng thẻ gắn toàn cục, đường nào cũng đóng cho tới
 * khi có người viết `@Public()` lên đó. Đóng-trước-mở-sau thì quên là an toàn;
 * mở-trước-đóng-sau thì quên là lộ.
 */
export const Public = () => SetMetadata(IS_PUBLIC, true);
