/**
 * Bảng emoji + sticker — mở THAY CHỖ bàn phím, cùng chiều cao (như Telegram).
 * Hàng trên: các nhóm emoji (chạm là nhảy tới nhóm). Hàng dưới: Emoji · Sticker.
 * Chạm emoji = chèn vào ô soạn (chưa gửi); chạm sticker = gửi ngay.
 * Lưới là FlashList — 700 emoji vẫn mượt, chỉ vẽ phần đang thấy.
 */
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import type { FlashListRef } from '@shopify/flash-list';
import { List, Tap, Txt } from '@ui';
import { font, radius, space, useStyles, type Palette } from '@design';
import { Sticker } from '../../../components/Sticker';
import { EMOJI_GROUPS, EMOJI_LISTS, type EmojiGroupId } from '../../../utils/emojiSet';
import { STICKERS, type StickerId } from '../../../utils/stickers.generated';

export const PANEL_HEIGHT = 300;
const EMOJI_COLS = 8;
const STICKER_COLS = 4;

type Cell = { key: string; emoji: string } | { key: string; head: EmojiGroupId };

const STICKER_IDS = Object.keys(STICKERS) as StickerId[];

export const EmojiPanel = memo(function EmojiPanel({
  onEmoji,
  onSticker,
  groupLabel,
  emojiLabel,
  stickerLabel,
}: {
  onEmoji: (emoji: string) => void;
  onSticker: (id: StickerId) => void;
  groupLabel: (id: EmojiGroupId) => string;
  emojiLabel: string;
  stickerLabel: string;
}) {
  const s = useStyles(make);
  const { width } = useWindowDimensions();
  const [tab, setTab] = useState<'emoji' | 'sticker'>('emoji');
  const list = useRef<FlashListRef<Cell>>(null);

  // Một danh sách phẳng: tiêu đề nhóm chiếm trọn hàng, emoji xếp 8 cột.
  const cells = useMemo<Cell[]>(() => {
    const out: Cell[] = [];
    for (const g of EMOJI_GROUPS) {
      out.push({ key: `h-${g.id}`, head: g.id });
      for (const e of EMOJI_LISTS[g.id]) out.push({ key: `${g.id}-${e}`, emoji: e });
    }
    return out;
  }, []);
  const headIndex = useMemo(() => {
    const m = new Map<EmojiGroupId, number>();
    cells.forEach((c, i) => {
      if ('head' in c) m.set(c.head, i);
    });
    return m;
  }, [cells]);

  const cell = Math.floor((width - space.sm * 2) / EMOJI_COLS);
  const stickerCell = Math.floor((width - space.sm * 2) / STICKER_COLS);

  const renderEmoji = useCallback(
    ({ item }: { item: Cell }) =>
      'head' in item ? (
        <Txt variant="faint" tone="muted" style={s.head}>
          {groupLabel(item.head)}
        </Txt>
      ) : (
        <Tap
          onPress={() => onEmoji(item.emoji)}
          feedback={null}
          scaleTo={0.8}
          style={[s.cell, { width: cell, height: cell }]}
          accessibilityLabel={item.emoji}
        >
          <Txt style={s.emoji}>{item.emoji}</Txt>
        </Tap>
      ),
    [cell, groupLabel, onEmoji, s],
  );

  const renderSticker = useCallback(
    ({ item }: { item: StickerId }) => (
      <Tap
        onPress={() => onSticker(item)}
        feedback="select"
        scaleTo={0.85}
        style={[s.cell, { width: stickerCell, height: stickerCell }]}
        accessibilityLabel={item}
      >
        <Sticker id={item} size={stickerCell - space.lg} />
      </Tap>
    ),
    [onSticker, s, stickerCell],
  );

  return (
    <View style={s.panel}>
      {tab === 'emoji' ? (
        <>
          <View style={s.groups}>
            {EMOJI_GROUPS.map((g) => (
              <Tap
                key={g.id}
                onPress={() => list.current?.scrollToIndex({ index: headIndex.get(g.id) ?? 0, animated: true })}
                feedback="select"
                scaleTo={0.85}
                style={s.groupBtn}
                accessibilityLabel={groupLabel(g.id)}
              >
                <Txt style={s.groupEmoji}>{EMOJI_LISTS[g.id][0]}</Txt>
              </Tap>
            ))}
          </View>
          <List
            ref={list}
            data={cells}
            renderItem={renderEmoji}
            keyExtractor={keyOf}
            numColumns={EMOJI_COLS}
            overrideItemLayout={(layout, item) => {
              if ('head' in item) layout.span = EMOJI_COLS;
            }}
            getItemType={(c) => ('head' in c ? 'head' : 'emoji')}
            contentContainerStyle={s.grid}
          />
        </>
      ) : (
        <List
          data={STICKER_IDS}
          renderItem={renderSticker}
          keyExtractor={(id) => id}
          numColumns={STICKER_COLS}
          contentContainerStyle={s.grid}
        />
      )}

      <View style={s.tabs}>
        {(['emoji', 'sticker'] as const).map((k) => (
          <Tap
            key={k}
            onPress={() => setTab(k)}
            feedback="select"
            scaleTo={0.95}
            style={[s.tab, tab === k && s.tabOn]}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === k }}
          >
            <Txt variant="label" tone={tab === k ? 'default' : 'muted'} style={s.tabText}>
              {k === 'emoji' ? emojiLabel : stickerLabel}
            </Txt>
          </Tap>
        ))}
      </View>
    </View>
  );
});

const keyOf = (c: Cell) => c.key;

const make = (c: Palette) =>
  StyleSheet.create({
    panel: { height: PANEL_HEIGHT, backgroundColor: c.surface },
    groups: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: space.xs,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    groupBtn: { padding: space.xs },
    groupEmoji: { fontSize: 20, lineHeight: 26 },
    grid: { paddingHorizontal: space.sm, paddingBottom: space.sm },
    head: { paddingTop: space.sm, paddingBottom: space.xs, paddingLeft: space.xs, fontFamily: font.bodyBold },
    cell: { alignItems: 'center', justifyContent: 'center' },
    emoji: { fontSize: 28, lineHeight: 36 },
    tabs: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: space.sm,
      paddingVertical: space.xs,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
    },
    tab: { paddingHorizontal: space.lg, paddingVertical: space.xs, borderRadius: radius.full },
    tabOn: { backgroundColor: c.surfaceRaised },
    tabText: { fontFamily: font.bodyBold },
  });
