import { useCallback, useMemo } from 'react';
import { Tabs, type BottomTabBarProps } from 'expo-router/tabs';
import { TabBar, type TabItem } from '@ui';
import { useT } from '@i18n';
import { useHomeNav } from '@/features/home/store/homeNav';

type Key = 'home' | 'feed' | 'settings';

/**
 * Ba nút: Trang chủ · Lướt ảnh · Cài đặt. Hai nút đầu cùng một màn (`home`),
 * khác vị trí lướt — xem `homeNav.ts`. Bạn bè và tin nhắn vẫn ở hai góc trên
 * của màn chính, mở chồng lên.
 *
 * `freezeOnBlur` cho Cài đặt: nằm sau thì không vẽ lại. Màn chính KHÔNG đóng
 * băng — nó phải kịp nhận `active=false` để tắt camera khi rời đi.
 */
export default function TabsLayout() {
  return (
    <Tabs tabBar={renderBar} screenOptions={{ headerShown: false, animation: 'none' }}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="settings" options={{ freezeOnBlur: true }} />
    </Tabs>
  );
}

const renderBar = (props: BottomTabBarProps) => <AppTabBar {...props} />;

function AppTabBar({ state, navigation }: BottomTabBarProps) {
  const t = useT();
  const page = useHomeNav((s) => s.page);
  const reviewing = useHomeNav((s) => s.reviewing);
  const go = useHomeNav((s) => s.go);
  const route = state.routes[state.index]?.name;
  const active: Key = route === 'settings' ? 'settings' : page === 0 ? 'home' : 'feed';

  const items = useMemo<TabItem<Key>[]>(
    () => [
      { key: 'home', label: t('tabs.home'), icon: 'home' },
      { key: 'feed', label: t('tabs.feed'), icon: 'images' },
      { key: 'settings', label: t('tabs.settings'), icon: 'settings' },
    ],
    [t],
  );

  const press = useCallback(
    (key: Key) => {
      if (key === 'settings') {
        navigation.navigate('settings');
        return;
      }
      navigation.navigate('home');
      go(key === 'home' ? 'camera' : 'feed');
    },
    [go, navigation],
  );

  return (
    <TabBar
      items={items}
      active={active}
      onPress={press}
      dimmed={reviewing && route === 'home'}
      label={t('tabs.label')}
    />
  );
}
