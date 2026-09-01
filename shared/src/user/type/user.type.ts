import type { ADMIN_ROLES, USER_ROLES } from '../constant/index.js';

/** Vai của một người. Suy ra từ danh sách, không gõ lại. */
export type TUserRole = (typeof USER_ROLES)[number];

/** Vai vào được cửa quản trị. */
export type TAdminRole = (typeof ADMIN_ROLES)[number];
