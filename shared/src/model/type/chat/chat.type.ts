import type { CHAT_BACKGROUNDS, CHAT_MESSAGE_KINDS } from '../../constant/index.js';
import type { IChatMessage } from '../../interface/index.js';
import type { TErrCode } from '../catalog/error.type.js';

export type TChatMessageKind = (typeof CHAT_MESSAGE_KINDS)[number];
export type TChatBackground = (typeof CHAT_BACKGROUNDS)[number];

/**
 * Ack của socket `chat.send`. Hỏng thì chỉ có `code` (tra chữ như REST) —
 * app gửi lại với CÙNG `clientId` là an toàn.
 */
export type TChatSendAck = { ok: true; data: IChatMessage } | { ok: false; code: TErrCode };
