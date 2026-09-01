/**
 * Màn Khoảnh khắc — ảnh bạn bè gửi tới.
 *
 * Danh sách dùng <List> (FlashList), không dùng FlatList — xem chú thích trong
 * src/components/layout/List.tsx để biết vì sao đây là chỗ quyết định độ mượt.
 *
 * Ô của danh sách là `MomentCard`, một component ĐẶT TÊN nằm ở file khác. Viết
 * hàm vô danh thẳng trong `renderItem` thì mỗi lần màn vẽ lại là một hàm mới →
 * FlashList coi như ô mới → mất sạch cái lợi của tái dùng ô.
 *
 * Màn trống vẽ ba khung ảnh xoè ra ĐÚNG dáng chồng ảnh ở màn Chào mừng. Cùng
 * một ngôn ngữ hình, chỉ khác là chưa có gì trong đó.
 */
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { EmptyState, GhostFrame, List, Screen, TopBar, Txt } from '@ui';
import { color, radius, space } from '@design';
import { useAgo, useT } from '@i18n';
import { MomentCard, type Quick } from '../components/MomentCard';
import type { Moment } from '../types';

export function FeedScreen({
  moments,
  onOpenCamera,
  onReply,
}: {
  moments: readonly Moment[];
  onOpenCamera: () => void;
  onReply: (moment: Moment, emoji: Quick | null) => void;
}) {
  const t = useT();
  const ago = useAgo();

  const renderItem = useCallback(
    ({ item }: { item: Moment }) => (
      <MomentCard
        moment={item}
        ago={ago(new Date(item.at))}
        replyHint={t('feed.replyTo', { name: item.author.name })}
        repliedLabel={t('feed.replied', { name: item.author.name })}
        onReply={onReply}
      />
    ),
    [ago, onReply, t],
  );

  if (moments.length === 0) {
    return (
      <Screen>
        <TopBar
          title={t('feed.title')}
          closeLabel={t('common.closeScreen')}
          closeIcon="down"
          onClose={onOpenCamera}
        />
        <EmptyState
          art={<GhostFan />}
          title={t('feed.emptyTitle')}
          message={t('feed.emptyMessage')}
          actionLabel={t('feed.openCamera')}
          onAction={onOpenCamera}
        />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      {/* Thanh trên nằm NGOÀI danh sách, không phải ListHeaderComponent: nút
          đóng phải luôn ở đó, không được cuộn mất. */}
      <View style={s.bar}>
        <TopBar
          title={t('feed.title')}
          closeLabel={t('common.closeScreen')}
          closeIcon="down"
          onClose={onOpenCamera}
        />
      </View>

      <List
        data={moments}
        renderItem={renderItem}
        keyExtractor={keyOf}
        ListFooterComponent={<Footer note={t('feed.window')} />}
      />
    </Screen>
  );
}

const keyOf = (m: Moment) => m.id;

/** Nhắc luật 48 giờ ngay trong feed: người dùng không phải đi tìm trong Cài đặt. */
function Footer({ note }: { note: string }) {
  return (
    <View style={s.footer}>
      <Txt variant="faint" tone="faint" center>
        {note}
      </Txt>
    </View>
  );
}

/** Ba khung đứt nét xoè ra — cùng dáng với chồng ảnh ở màn Chào mừng. */
function GhostFan() {
  return (
    <View style={s.fan}>
      <View style={[s.fanCard, s.fanLeft]}>
        <GhostFrame size={112} />
      </View>
      <View style={[s.fanCard, s.fanRight]}>
        <GhostFrame size={112} />
      </View>
      <View style={s.fanCard}>
        <GhostFrame size={124} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  bar: { paddingHorizontal: space.lg },
  footer: { paddingHorizontal: space.lg, paddingTop: space.sm },

  fan: { width: 230, height: 160, alignItems: 'center', justifyContent: 'center' },
  fanCard: {
    position: 'absolute',
    borderRadius: radius.frame,
    backgroundColor: color.surfaceSunken,
  },
  fanLeft: { transform: [{ translateX: -40 }, { translateY: 8 }, { rotate: '-9deg' }], opacity: 0.5 },
  fanRight: { transform: [{ translateX: 40 }, { translateY: 8 }, { rotate: '9deg' }], opacity: 0.5 },
});
