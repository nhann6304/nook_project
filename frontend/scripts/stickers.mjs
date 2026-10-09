// Sinh bộ sticker chat `src/features/chat/utils/stickers.generated.ts` từ
// Fluent Emoji Flat (Microsoft, MIT) — gói `@iconify-json/fluent-emoji-flat`
// chỉ là devDependency. Thêm sticker: thêm tên vào STICKERS rồi chạy
// `node scripts/stickers.mjs`. KHÔNG đổi tên đã có — tin cũ lưu mã sticker.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const set = JSON.parse(
  readFileSync(join(here, '../node_modules/@iconify-json/fluent-emoji-flat/icons.json'), 'utf8'),
);
const out = join(here, '../src/features/chat/utils/stickers.generated.ts');

const STICKERS = [
  'smiling-face-with-heart-eyes', 'face-with-tears-of-joy', 'loudly-crying-face',
  'smiling-face-with-hearts', 'partying-face', 'face-blowing-a-kiss', 'pleading-face',
  'grinning-squinting-face', 'winking-face-with-tongue', 'star-struck', 'hugging-face',
  'thinking-face', 'sleeping-face', 'exploding-head', 'smiling-face-with-sunglasses',
  'pouting-face', 'melting-face', 'saluting-face', 'face-savoring-food',
  'smiling-face-with-halo', 'face-with-open-mouth', 'ghost',
  'red-heart', 'sparkling-heart', 'fire', 'sparkles', 'thumbs-up', 'clapping-hands',
  'folded-hands', 'waving-hand',
  'dog-face', 'cat-face', 'bear', 'panda', 'rabbit-face', 'unicorn', 'teddy-bear',
  'hot-beverage', 'birthday-cake', 'party-popper', 'rainbow', 'sun-with-face',
  'crescent-moon', 'camera-with-flash', 'rose', 'cherry-blossom',
];

const size = set.width ?? 32;
const items = STICKERS.map((name) => {
  const icon = set.icons[name];
  if (!icon) throw new Error(`missing sticker ${name}`);
  const xml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">${icon.body}</svg>`;
  return `  ${JSON.stringify(name)}: ${JSON.stringify(xml)},`;
});

writeFileSync(
  out,
  `/* TỆP SINH RA — sửa \`scripts/stickers.mjs\` rồi chạy lại, đừng sửa tay.
 * Fluent Emoji Flat © Microsoft (MIT). Khoá là MÃ sticker lưu trong tin nhắn. */
export const STICKERS = {
${items.join('\n')}
} as const;

export type StickerId = keyof typeof STICKERS;
`,
);
console.log(`wrote ${items.length} stickers`);
