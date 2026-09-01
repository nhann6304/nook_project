/**
 * @ui — cửa DUY NHẤT vào bộ component.
 *
 * Màn hình import từ '@ui', không bao giờ đi thẳng vào đường dẫn con.
 * Một cửa thì: đổi cấu trúc thư mục bên trong không phải sửa 40 file, và
 * nhìn danh sách dưới đây là biết Nook có sẵn những mảnh nào — không ai phải
 * đi tự viết lại một cái nút.
 *
 * Thiếu mảnh thì THÊM VÀO ĐÂY, đừng dựng tại chỗ trong màn hình.
 */

/* — Mảnh cơ bản — */
export { Txt, type TxtProps } from './primitives/Txt';
export { Tap, type TapProps } from './primitives/Tap';
export { Button, type ButtonProps } from './primitives/Button';
export { IconButton, type IconButtonProps } from './primitives/IconButton';
export { CaptionField } from './primitives/CaptionField';
export { Field, type FieldProps } from './primitives/Field';
export { HelperText } from './primitives/HelperText';
export { CodeInput, type CodeInputProps } from './primitives/CodeInput';
export { Segmented, type SegmentedOption } from './primitives/Segmented';
export { Img, type ImgProps } from './primitives/Img';

/* — Bố cục — */
export { Screen, type ScreenProps } from './layout/Screen';
export { Row, Col, Spacer, Flex } from './layout/Stack';
export { Card, Pill, Divider } from './layout/Surface';
export { List, type ListProps } from './layout/List';
export { Scroll } from './layout/Scroll';
export { TopBar, type TopBarProps } from './layout/TopBar';

/* — Thương hiệu — */
export { Rings, type RingsProps } from './brand/Rings';
export { Wordmark, Lockup } from './brand/Wordmark';
export { Halo } from './brand/Halo';
export { GhostFrame } from './brand/GhostFrame';
export { Avatar, type AvatarProps } from './brand/Avatar';

/* — Phản hồi — */
export { EmptyState } from './feedback/EmptyState';
export { Loading } from './feedback/Loading';
