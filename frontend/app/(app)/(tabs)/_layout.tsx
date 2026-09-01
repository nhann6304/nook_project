/**
 * Ba tab. Thanh tab tự vẽ (xem `src/components/layout/TabBar.tsx`) chứ không
 * dùng thanh mặc định của navigator — thanh mặc định mang theo chiều cao, nền
 * và nhãn của hệ điều hành, ba thứ khác nhau giữa iOS và Android.
 *
 * Thứ tự Khoảnh khắc · Camera · Trò chuyện đặt Camera vào GIỮA có chủ đích: nó
 * là màn mặc định và là việc chính, nên nó phải nằm ở chỗ ngón cái rơi vào.
 */
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TabBar, type TabItem } from '@ui';
import { useColors } from '@design';
import { useT } from '@i18n';

const ICONS = {
  feed: 'grid-outline',
  camera: 'radio-button-on',
  chat: 'chatbubble-outline',
} as const;

const ICONS_ON = {
  feed: 'grid',
  camera: 'radio-button-on',
  chat: 'chatbubble',
} as const;

export default function TabsLayout() {
  const t = useT();
  const c = useColors();

  const items: TabItem[] = (['feed', 'camera', 'chat'] as const).map((key) => ({
    key,
    label: t(`tabs.${key}`),
    icon: (active) => (
      <Ionicons
        name={active ? ICONS_ON[key] : ICONS[key]}
        size={key === 'camera' ? 26 : 22}
        color={active ? c.text : c.textFaint}
      />
    ),
  }));

  return (
    <Tabs
      initialRouteName="camera"
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: c.bg } }}
      tabBar={({ state, navigation }) => (
        <TabBar
          items={items}
          current={state.routeNames[state.index] ?? 'camera'}
          onPress={(key) => navigation.navigate(key)}
        />
      )}
    >
      <Tabs.Screen name="feed" />
      <Tabs.Screen name="camera" />
      <Tabs.Screen name="chat" />
    </Tabs>
  );
}
