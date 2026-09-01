# Nook — Bảng màu người dùng chọn được

Năm bảng, mặc định **Đất nung**. Đổi trong **Cài đặt → Màu sắc**, đổi là thấy
ngay, nhớ giữa các lần mở app.

---

## 1 · Lấy màu ở đâu

`@design` **không xuất `color` nữa.** Đây là chủ đích: không có cách nào lấy
được màu ngoài hai cửa dưới, nên không có cách nào viết một style chết cứng màu.

```tsx
import { StyleSheet } from 'react-native';
import { useColors, useStyles, space, type Palette } from '@design';

// Ở TẦNG MODULE. Không khai trong thân component.
const make = (c: Palette) =>
  StyleSheet.create({
    box: { backgroundColor: c.surface, padding: space.lg },
  });

export function Thing() {
  const s = useStyles(make);   // StyleSheet theo bảng đang chọn
  const c = useColors();       // màu rời — cho prop `color` của icon
  return (
    <View style={s.box}>
      <Ionicons name="heart" color={c.accent} />
    </View>
  );
}
```

`make` **phải** khai ở tầng module. Khai trong thân component là mỗi lần vẽ một
hàm mới, khoá mới, và bảng nhớ không bao giờ trúng — `StyleSheet.create` sẽ chạy
lại mỗi lần vẽ.

`make` không dùng tới `c` thì viết `const make = () => StyleSheet.create({…})`.

---

## 2 · Vì sao không dùng thẳng `StyleSheet.create` ở tầng module nữa

`StyleSheet.create` chạy **một lần** lúc nạp file và chốt cứng mọi giá trị bên
trong. Người dùng đổi bảng màu thì style đó vẫn giữ màu cũ, **mãi mãi**, cho tới
khi tắt app. Không có mẹo nào lách được: RN nhận cả object thường làm style,
nhưng object dựng ở tầng module cũng chốt cứng y hệt.

---

## 3 · Vì sao không tốn hiệu năng

Style được nhớ theo cặp **(hàm dựng, bảng màu)** trong một bảng tra ở tầng
module. Một component với một bảng màu → `StyleSheet.create` chạy **đúng một
lần trong cả đời app**, không phải mỗi lần vẽ. Đổi bảng rồi đổi về là lấy lại
bản đã nhớ.

Bảng tra ngoài cùng là `WeakMap` khoá theo chính hàm dựng, nên component bị gỡ
là mục tương ứng tự biến mất.

Đọc bảng màu bằng selector `useTheme((s) => s.palette)`: chừng nào chưa đổi thì
tham chiếu không đổi → **không có gì vẽ lại**. Đổi bảng thì mọi màn đang mở vẽ
lại đúng một lần. Context không làm được điều đó — nó bắt mọi thứ bên dưới vẽ
lại mỗi lần provider vẽ lại, kể cả chỗ không đụng tới màu.

---

## 4 · Năm bảng

| Khoá | Tên | Sắc | Dành cho |
|---|---|---|---|
| `terracotta` | Đất nung | cam đất → hồng | mặc định, ấm |
| `moss` | Rêu | xanh lá trầm | mắt mỏi với màu ấm |
| `deepsea` | Biển đêm | lơ → lam | phòng tối, đọc khuya |
| `dusk` | Hoàng hôn | tím khói → hồng | dịu, hơi lạnh |
| `neutral` | Trung tính | vàng đồng rất nhạt | gần như không màu |

Mỗi bảng là một bộ **đầy đủ**: nền, bề mặt, đường kẻ, chữ đều ngả theo sắc của
bảng. Chỉ đổi màu nhấn thì cả năm trông y hệt nhau, chỉ khác cái nút.

---

## 5 · Thêm một bảng

1. Mở script sinh màu, thêm một dòng `pal(...)` với sắc nền và hai đầu sắc chính.
2. Chạy nó, xem bảng tương phản in ra. **Mọi cặp phải đạt** — script tự chấm.
3. Chép kết quả vào `src/design/palettes.ts`.
4. Thêm khoá vào `PALETTE_KEYS` và tên vào `theme.*` ở **cả hai** tệp ngôn ngữ
   (tsc sẽ đòi).

Sinh bằng script rồi **chép vào**, không tính lúc chạy: tính lúc chạy là mỗi lần
mở app tốn công cho một kết quả không bao giờ đổi.

---

## 6 · Ngưỡng phải đạt

Đo bằng WCAG 2.1 trên chính `bg` của từng bảng:

| Vai | Ngưỡng | Thực tế cả năm bảng |
|---|---|---|
| `text` | ≥ 14:1 | 14.4 – 14.5 |
| `textMuted` | ≥ 4.5:1 | 6.8 – 6.9 |
| `textFaint` | ≥ 4.5:1 | 4.85 – 4.95 |
| `accent` · `accent2` · `accentBright` · `accentDeep` | ≥ 4.5:1 | 4.87 – 9.65 |
| `honey` · `mint` · `violet` · `danger` | ≥ 4.5:1 | 6.5 – 11.0 |
| `onAccent` trên **cả ba** chặng dải màu | ≥ 4.5:1 | 5.66 – 8.32 |
| vòng độ thân, cấp 1 | ≥ 3:1 | 3.7 |

`textDisabled` là ngoại lệ **duy nhất** và cố ý: ~2.4:1, **không** đạt chuẩn
đọc. Nó chỉ dùng cho chữ đã tắt và nét trang trí. Chữ nhỏ nhất mà người ta phải
đọc được là `textFaint`.

---

## 7 · Bão hoà đi theo SẮC

Bản sinh đầu tiên đặt một mức bão hoà chung và ra kết quả sai: cam ở S=0.76
trông ấm, xanh lá ở S=0.74 trông như đèn neon. Mắt chịu được sắc ấm đậm hơn hẳn
sắc lạnh. Trần bão hoà theo vùng sắc:

| Vùng sắc | Trần |
|---|---|
| cam / đỏ / hồng | 0.72 – 0.76 |
| vàng | 0.52 |
| xanh lá | 0.40 |
| lơ | 0.46 |
| lam | 0.52 |
| tím | 0.54 |

Bảng **Trung tính** còn nhân thêm 0.55 lên trần đó, rồi **fit lại độ sáng** để
tương phản không rơi — hạ bão hoà mà giữ nguyên độ sáng là tuột chuẩn ngay.

---

## 8 · Nền không bao giờ là đen tuyệt đối

Bản trước dùng `#0E0D0C`, gần như đen thuần. Đặt một màu bão hoà lên đó là biên
độ sáng lớn nhất một màn hình làm được — mắt phải đổi khẩu độ mỗi lần nhìn từ
nền sang nút, và đó là thứ làm mỏi mắt nhanh nhất trên một app dùng buổi tối.

Mọi bảng đặt nền ở độ sáng ~8%, ngả theo sắc của bảng.
