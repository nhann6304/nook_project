/**
 * Cửa duy nhất vào hệ thống thiết kế.
 * Mọi file khác import từ '@design', không bao giờ import thẳng file con.
 * Một cửa thì đổi cấu trúc bên trong không phải sửa 40 file.
 *
 * MÀU đi qua hook, không phải hằng số: `useColors()` cho màu rời,
 * `useStyles(make)` cho StyleSheet. Lý do ở đầu file `useStyles.ts`.
 */
export * from './tokens';
export * from './styles';
export * from './palettes';
export * from './theme';
export * from './useStyles';
