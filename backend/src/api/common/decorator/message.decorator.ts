import { SetMetadata } from '@nestjs/common';
import type { MsgCode } from '@nook/shared';

export const MESSAGE_CODE = 'nook:messageCode';

/**
 * Đặt mã thông báo cho một cửa.
 *
 *   @Message(MSG.CODE_SENT)
 *   @Post(API.auth.code)
 *
 * Không dán gì thì mặc định là `MSG.OK`. Chỉ dán khi app THẬT SỰ cần nói một
 * câu khác — dán cho mọi cửa là tự đẻ ra một danh sách mã không ai dùng tới.
 *
 * Vẫn là MÃ, không phải câu. Câu chữ nằm ở kho chữ của app.
 */
export const Message = (code: MsgCode) => SetMetadata(MESSAGE_CODE, code);
