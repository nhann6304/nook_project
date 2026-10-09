import { useCallback, useMemo } from 'react';
import TopTabs from 'expo-router/js-top-tabs';
import { TabBar, type TabItem } from '@ui';
import { useT } from '@i18n';
import { useHomeNav } from '@/features/home/store/homeNav';
import { useChats } from '@/features/chat/store/chatStore';

type Key = 'journal' | 'home' | 'chats';

/**
 * Ba nút như Locket (08/10/2026): Ký ức · Chụp (giữa) · Tin nhắn. Bạn bè mở
 * từ viên "N Bạn bè" trên cùng màn Chụp (`circle`); Cài đặt nằm trong trang cá
 * nhân (avatar góc phải → `me`). Ảnh bạn bè KHÔNG phải tab — vuốt lên từ
 * camera. Bấm "Chụp" khi đang ở màn chính thì về camera.
 *
 * VUỐT NGANG giữa ba trang như Locket (TopTabs = react-native-pager-view, trang
 * chạy theo ngón tay trên luồng gốc). Thanh tab đặt ở đáy. Đang xem lại ảnh vừa
 * chụp thì khoá vuốt — hàng avatar bên dưới cũng lướt ngang. Hai tab bên `lazy`:
 * chưa mở thì chưa dựng. Camera tắt khi rời màn chính nhờ `useIsFocused`.
 */
export default function TabsLayout() {
  const reviewing = useHomeNav((s) => s.reviewing);
  return (
    <TopTabs
      initialRouteName="home"
      tabBarPosition="bottom"
      tabBar={renderBar}
      screenOptions={{ swipeEnabled: !reviewing, lazy: true }}
    >
      <TopTabs.Screen name="journal" />
      <TopTabs.Screen name="home" />
      <TopTabs.Screen name="chats" />
    </TopTabs>
  );
}

/** Phần của props thanh tab mà mình dùng (kiểu gốc của TopTabs là `any`). */
type BarProps = {
  state: { index: number; routes: readonly { name: string }[] };
  navigation: { navigate: (name: string) => void };
};

const renderBar = (props: BarProps) => <AppTabBar {...props} />;

function AppTabBar({ state, navigation }: BarProps) {
  const t = useT();
  const reviewing = useHomeNav((s) => s.reviewing);
  const go = useHomeNav((s) => s.go);
  const unread = useChats((s) => s.conversations.some((c) => c.unread > 0));
  const active = (state.routes[state.index]?.name ?? 'home') as Key;

  const items = useMemo<TabItem<Key>[]>(
    () => [
      { key: 'journal', label: t('tabs.memories'), icon: 'grid' },
      { key: 'home', label: t('tabs.home'), icon: 'home' },
      { key: 'chats', label: t('tabs.chats'), icon: 'chat', badge: unread },
    ],
    [t, unread],
  );

  const press = useCallback(
    (key: Key) => {
      if (key === 'home' && active === 'home') go('camera');
      navigation.navigate(key);
    },
    [active, go, navigation],
  );

  return (
    <TabBar
      items={items}
      active={active}
      onPress={press}
      dimmed={reviewing && active === 'home'}
      label={t('tabs.label')}
    />
  );
}
