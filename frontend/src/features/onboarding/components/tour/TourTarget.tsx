import type { StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';
import { useTourTarget } from '../../hooks/useTourTarget';
import type { TourTargetId } from '../../utils/tourSteps';

/** Bọc một nút để tour chỉ vào nó. Không đổi bố cục: chỉ là một View ôm sát. */
export function TourTarget({
  id,
  style,
  children,
}: {
  id: TourTargetId;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const ref = useTourTarget(id);
  return (
    <View ref={ref} collapsable={false} style={style}>
      {children}
    </View>
  );
}
