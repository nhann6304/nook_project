/**
 * Hàng người trong góc — nằm ngay dưới thanh trên của màn Camera.
 *
 * Nó trả lời câu hỏi người ta hỏi TRƯỚC KHI bấm chụp: "tấm này ai thấy?".
 * Locket có một hàng y như vậy, và đó không phải trang trí — biết trước ai nhận
 * là điều kiện để người ta dám chụp thoải mái.
 *
 * Nó cũng lấp khoảng trống giữa thanh trên và khung ngắm — chỗ trước đây là
 * hơn 100pt nền đen không có gì.
 *
 * ── Một ô "mời thêm", không phải bốn ô trống ─────────────────────────────
 * Bản đầu vẽ đủ số chỗ còn trống (góc 6 người thì bốn vòng đứt nét). Hỏng hai
 * đường: mười ô 40pt cộng khe là 508pt, tràn khỏi mọi máy nên phải cuộn mới
 * thấy hết — mà cuộn để xem mấy vòng trống giống hệt nhau thì không ai cuộn;
 * và bốn ô trống giống nhau không nói thêm được gì so với một ô dấu cộng.
 * Con số mười vẫn nhìn thấy đủ ở màn Góc, nơi nó đáng được nhìn kỹ.
 *
 * ── Lúc xem lại ảnh thì KHÔNG có ô mời ──────────────────────────────────
 * Ở bước đó hàng này là danh sách người nhận. Một ô "mời thêm" xen vào giữa
 * danh sách người nhận là mời sai lúc.
 */
import { memo } from 'react';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, Scroll, Tap } from '@ui';
import { color, radius, space } from '@design';

const SIZE = 40;
/** Sức chứa một góc. Cùng con số với CircleScreen — đổi thì đổi cả hai. */
const CIRCLE_SIZE = 10;

export type StripFriend = { id: string; name: string; level: number; dormant?: boolean };

export const NookStrip = memo(function NookStrip({
  friends,
  inviteLabel,
  showInvite = true,
  onPressFriend,
  onInvite,
}: {
  friends: readonly StripFriend[];
  inviteLabel: string;
  /** Tắt ở bước xem lại ảnh: lúc đó hàng này là danh sách người nhận. */
  showInvite?: boolean;
  onPressFriend: () => void;
  onInvite: () => void;
}) {
  const room = friends.length < CIRCLE_SIZE;

  return (
    <Scroll
      horizontal
      // Căn giữa khi còn thừa chỗ, tràn thì cuộn — `flexGrow` làm được cả hai
      // mà không cần đo bề ngang máy.
      contentContainerStyle={s.row}
      showsHorizontalScrollIndicator={false}
      style={s.box}
    >
      {friends.map((f) => (
        <Avatar
          key={f.id}
          name={f.name}
          level={f.level}
          dormant={f.dormant}
          size={SIZE}
          onPress={onPressFriend}
          label={f.name}
          recyclingKey={f.id}
        />
      ))}

      {showInvite && room ? (
        <Tap
          accessibilityRole="button"
          accessibilityLabel={inviteLabel}
          onPress={onInvite}
          scaleTo={0.9}
          style={s.invite}
        >
          <Ionicons name="add" size={22} color={color.textMuted} />
        </Tap>
      ) : null}
    </Scroll>
  );
});

const s = StyleSheet.create({
  box: { alignSelf: 'stretch', flexGrow: 0 },
  row: { justifyContent: 'center', gap: space.md, paddingHorizontal: space.lg },
  invite: {
    width: SIZE,
    height: SIZE,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: color.borderSoft,
    backgroundColor: color.surfaceSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
