/**
 * Cửa duy nhất vào hệ thống thiết kế.
 * Mọi file khác import từ '@design', không bao giờ import thẳng '@/design/tokens'.
 * Một cửa thì đổi cấu trúc bên trong không phải sửa 40 file.
 */
export * from './tokens';
export * from './styles';
