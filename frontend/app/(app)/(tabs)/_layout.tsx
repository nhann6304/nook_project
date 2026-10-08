import { useCallback, useMemo } from 'react';
import { Tabs, type BottomTabBarProps } from 'expo-router/tabs';
import { TabBar, type TabItem } from '@ui';
import { useT } from '@i18n';
import { useHomeNav } from '@/features/home/store/homeNav';
import { useChats } from '@/features/chat/store/chatStore';
import { lastMessage } from '@/features/chat/types';

type Key = 'home' | 'circle' | 'chats' | 'settings';

/**
 * Bốn nút: Chụp · Bạn bè · Tin nhắn · Cài đặt (07/10/2026). Ảnh bạn bè KHÔNG
 * phải tab — vuốt lên từ camera như Locket. Bấm "Chụp" khi đang ở màn chính
 * thì về camera (`homeNav.go`).
 *
 * `freezeOnBlur` cho ba tab sau: nằm sau thì không vẽ lại. Màn chính KHÔNG
 * đóng băng — nó phải kịp nhận `active=false` để tắt camera khi rời đi.
 */
export default function TabsLayout() {
  return (
    <Tabs tabBar={renderBar} screenOptions={{ headerShown: false, animation: 'none' }}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="circle" options={FROZEN} />
      <Tabs.Screen name="chats" options={FROZEN} />
      <Tabs.Screen name="settings" options={FROZEN} />
    </Tabs>
  );
}

const FROZEN = { freezeOnBlur: true } as const;

const renderBar = (props: BottomTabBarProps) => <AppTabBar {...props} />;

function AppTabBar({ state, navigation }: BottomTabBarProps) {
  const t = useT();
  const reviewing = useHomeNav((s) => s.reviewing);
  const go = useHomeNav((s) => s.go);
  const unread = useChats((s) => s.conversations.some((c) => lastMessage(c)?.mine === false));
  const active = (state.routes[state.index]?.name ?? 'home') as Key;

  const items = useMemo<TabItem<Key>[]>(
    () => [
      { key: 'home', label: t('tabs.home'), icon: 'camera', hue: 'blue' },
      { key: 'circle', label: t('tabs.friends'), icon: 'people', hue: 'green' },
      { key: 'chats', label: t('tabs.chats'), icon: 'chat', hue: 'purple', badge: unread },
      { key: 'settings', label: t('tabs.settings'), icon: 'settings', hue: 'orange' },
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
