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
export { Txt, type TxtProps } from './typography/Txt';
export { Tap, type TapProps } from './button/Tap';
export { Button, type ButtonProps } from './button/Button';
export { IconButton, type IconButtonProps } from './button/IconButton';
export { IconBadge } from './icon/IconBadge';
export { Icon, type IconName } from './icon/Icon';
export { CaptionField } from './input/CaptionField';
export { Field, type FieldProps } from './input/Field';
export { HelperText } from './input/HelperText';
export { CodeInput, type CodeInputProps } from './input/CodeInput';
export { ComposerField, type ComposerHandle } from './input/ComposerField';
export { Segmented, type SegmentedOption } from './input/Segmented';
export { Toggle } from './input/Toggle';
export { Img, type ImgProps } from './media/Img';
export { Clip } from './media/Clip';

/* — Bố cục — */
export { Screen, type ScreenProps } from './layout/Screen';
export { Row, Col, Spacer, Flex } from './layout/Stack';
export { Card, Pill, Divider } from './layout/Surface';
export { List, type ListProps } from './layout/List';
export { Scroll, type ScrollHandle } from './layout/Scroll';
export { TopBar, type TopBarProps } from './navigation/TopBar';
export { Pager, type PagerHandle, type PagerProps } from './layout/Pager';
export { TabBar, TAB_BAR_HEIGHT, useTabBarSpace, TabBarSpacer, type TabItem } from './navigation/TabBar';
export { Glass } from './layout/Glass';

/* — Thương hiệu — */
export { Rings, type RingsProps } from './brand/Rings';
export { SkyWash } from './brand/SkyWash';
export { Wordmark, Lockup } from './brand/Wordmark';
export { Halo } from './brand/Halo';
export { GhostFrame } from './brand/GhostFrame';
export { Avatar, type AvatarProps } from './avatar/Avatar';
export { BeadStrand } from './avatar/BeadStrand';
export { QrCode } from './media/QrCode';
export { AvatarStack } from './avatar/AvatarStack';

/* — Phản hồi — */
export { EmptyState } from './feedback/EmptyState';
export { Loading } from './feedback/Loading';
export { Toast } from './feedback/Toast';
export { Spinner } from './feedback/Spinner';
export { Shimmer } from './feedback/Shimmer';
export { OfflineBar } from './feedback/OfflineBar';
