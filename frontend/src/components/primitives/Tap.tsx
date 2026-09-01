/**
 * Tap — nền của mọi thứ bấm được.
 *
 * Vì sao không dùng thẳng Pressable với `style={({pressed}) => …}`:
 * cách đó chạy trên luồng JS. Khi luồng JS đang bận (đang mở camera, đang
 * giải mã ảnh trong feed) thì nút không kịp lún xuống — người dùng bấm mà
 * màn hình đứng im, và họ bấm lại lần nữa.
 *
 * Ở đây phản hồi nhấn chạy bằng Reanimated trên luồng UI: JS có kẹt thì nút
 * vẫn lún đúng lúc ngón tay chạm. Đây là chỗ khác biệt lớn nhất giữa app
 * "mượt" và app "hơi lag" mà người ta không chỉ ra được là lag ở đâu.
 */
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { duration, spring } from '@design';
import { capture, confirm, select, tap } from '@/lib/haptics';

/** Bảng tra thay cho truy cập động vào namespace — tra tĩnh thì đọc là biết
 *  nút này rung kiểu gì, và bộ đóng gói cắt được phần không dùng tới. */
const FEEL = { tap, confirm, select, capture } as const;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type TapProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  /** Mức lún khi nhấn. 1 = không lún. */
  scaleTo?: number;
  /** Mức mờ khi nhấn. 1 = không mờ. */
  fadeTo?: number;
  /** Nhịp rung khi nhấn. `null` = im lặng. */
  feedback?: keyof typeof FEEL | null;
  children?: React.ReactNode;
};

export function Tap({
  style,
  scaleTo = 0.97,
  fadeTo = 1,
  feedback = 'tap',
  disabled,
  onPressIn,
  onPressOut,
  onPress,
  ...rest
}: TapProps) {
  const pressed = useSharedValue(0);

  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pressed.value * (scaleTo - 1) }],
    opacity: 1 + pressed.value * (fadeTo - 1),
  }));

  // Không bọc useCallback: React Compiler đang bật và tự ghi nhớ những hàm này.
  // Bọc tay ở đây còn làm luật react-hooks kêu, vì `pressed` là kho ngoài React
  // — sửa nó bên trong một hàm đã ghi nhớ tay là đúng cái luật đó cấm.
  const handleIn: NonNullable<PressableProps['onPressIn']> = (e) => {
    pressed.value = withSpring(1, spring.press);
    onPressIn?.(e);
  };

  const handleOut: NonNullable<PressableProps['onPressOut']> = (e) => {
    pressed.value = withTiming(0, { duration: duration.fast });
    onPressOut?.(e);
  };

  const handlePress: NonNullable<PressableProps['onPress']> = (e) => {
    if (feedback) FEEL[feedback]();
    onPress?.(e);
  };

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={disabled}
      onPressIn={handleIn}
      onPressOut={handleOut}
      onPress={handlePress}
      style={[style, anim]}
      {...rest}
    />
  );
}
