/**
 * Bộ emoji của bảng chọn trong chat — chia nhóm như Telegram. Chỉ là chữ
 * Unicode, máy tự vẽ bằng phông emoji của nó: không tốn ảnh, gửi đi là chữ.
 * Tên nhóm nằm ở kho chữ (`chat.emojiCat.<id>`); ký tự đầu nhóm làm nút tab.
 */
export const EMOJI_GROUPS = [
  {
    id: 'smileys',
    emojis:
      '😀 😃 😄 😁 😆 🥹 😅 😂 🤣 🥲 😊 😇 🙂 🙃 😉 😌 😍 🥰 😘 😗 😙 😚 😋 😛 😝 😜 🤪 🤨 🧐 🤓 😎 🥸 🤩 🥳 😏 😒 😞 😔 😟 😕 🙁 😣 😖 😫 😩 🥺 😢 😭 😤 😠 😡 🤬 🤯 😳 🥵 🥶 😱 😨 😰 😥 😓 🤗 🤔 🫣 🤭 🫢 🫡 🤫 🫠 🤥 😶 😐 😑 😬 🙄 😯 😦 😧 😮 😲 🥱 😴 🤤 😪 😵 🤐 🥴 🤢 🤮 🤧 😷 🤒 🤕 🤑 🤠 😈 👻 💀 🤡 💩 👽 🤖 😺 😸 😹 😻 😼 😽 🙀 😿 😾',
  },
  {
    id: 'gestures',
    emojis:
      '👋 🤚 🖐️ ✋ 🖖 👌 🤌 🤏 ✌️ 🤞 🫰 🤟 🤘 🤙 👈 👉 👆 👇 ☝️ 👍 👎 ✊ 👊 🤛 🤜 👏 🙌 🫶 👐 🤲 🤝 🙏 ✍️ 💅 🤳 💪 🦾 👀 👁️ 👅 👄 🫦 💋 🧠 🫀 👶 🧒 👦 👧 🧑 👱 👨 👩 🧓 👴 👵 🙋 🙆 🙅 🤷 🤦 💁 🙇 🧏 💆 💇 🚶 🏃 💃 🕺 👯 🧘 🛀 🛌 👭 👫 👬 💏 💑 👪',
  },
  {
    id: 'hearts',
    emojis:
      '❤️ 🧡 💛 💚 🩵 💙 💜 🖤 🩶 🤍 🤎 💔 ❤️‍🔥 ❤️‍🩹 ❣️ 💕 💞 💓 💗 💖 💘 💝 💟 💌 💯 💢 💥 💫 💦 💨 🕳️ 💬 💭 💤 ✨ 🌟 ⭐ 🔥 🎉 🎊',
  },
  {
    id: 'animals',
    emojis:
      '🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐻‍❄️ 🐨 🐯 🦁 🐮 🐷 🐸 🐵 🙈 🙉 🙊 🐔 🐧 🐦 🐤 🦆 🦅 🦉 🦇 🐺 🐗 🐴 🦄 🐝 🪱 🐛 🦋 🐌 🐞 🐜 🪰 🐢 🐍 🦎 🐙 🦑 🦐 🦀 🐡 🐠 🐟 🐬 🐳 🐋 🦈 🐊 🐅 🐆 🦓 🦍 🐘 🦛 🦏 🐪 🦒 🦘 🐃 🐂 🐄 🐎 🐖 🐏 🐑 🦙 🐐 🦌 🐕 🐩 🐈 🐓 🦃 🦚 🦜 🦢 🕊️ 🐇 🦝 🦨 🦡 🦫 🦦 🦥 🐁 🐀 🐿️ 🦔 🌵 🎄 🌲 🌳 🌴 🌱 🌿 ☘️ 🍀 🎍 🍃 🍂 🍁 🍄 🌾 💐 🌷 🌹 🥀 🌺 🌸 🌼 🌻',
  },
  {
    id: 'food',
    emojis:
      '🍏 🍎 🍐 🍊 🍋 🍌 🍉 🍇 🍓 🫐 🍈 🍒 🍑 🥭 🍍 🥥 🥝 🍅 🥑 🥦 🥬 🥒 🌶️ 🌽 🥕 🥔 🍠 🥐 🥯 🍞 🥖 🧀 🥚 🍳 🥞 🧇 🥓 🥩 🍗 🍖 🌭 🍔 🍟 🍕 🥪 🌮 🌯 🥗 🍝 🍜 🍲 🍛 🍣 🍱 🥟 🍤 🍙 🍚 🍘 🍥 🥮 🍢 🍡 🍧 🍨 🍦 🥧 🧁 🍰 🎂 🍮 🍭 🍬 🍫 🍿 🍩 🍪 🥜 🍯 🥛 ☕ 🍵 🧋 🥤 🧃 🍺 🍻 🥂 🍷 🍹 🍸',
  },
  {
    id: 'activity',
    emojis:
      '⚽ 🏀 🏈 ⚾ 🎾 🏐 🏉 🎱 🏓 🏸 🏒 🏏 ⛳ 🏹 🎣 🥊 🛹 ⛸️ 🎿 🏂 🏋️ 🤸 ⛹️ 🤺 🏊 🚴 🏆 🥇 🥈 🥉 🏅 🎖️ 🎗️ 🎫 🎟️ 🎪 🎭 🎨 🎬 🎤 🎧 🎼 🎹 🥁 🎷 🎺 🎸 🪕 🎻 🎲 ♟️ 🎯 🎳 🎮 🧩',
  },
  {
    id: 'travel',
    emojis:
      '🚗 🚕 🚙 🚌 🏎️ 🚓 🚑 🚒 🛵 🏍️ 🚲 🛴 🚨 🚆 🚇 ✈️ 🛫 🛬 🚀 🛸 🚁 ⛵ 🚤 🛳️ 🚢 ⚓ 🗺️ 🗿 🗽 🗼 🏰 🏯 🏟️ 🎡 🎢 🎠 ⛲ 🏖️ 🏝️ 🏜️ 🌋 ⛰️ 🏔️ 🏕️ 🏠 🏡 🏢 🏬 🏥 🏦 🏨 🏪 🏫 🏩 💒 ⛪ 🕌 🛕 🌅 🌄 🌠 🎇 🎆 🌇 🌆 🏙️ 🌃 🌌 🌉 🌁 ☀️ 🌤️ ⛅ 🌥️ ☁️ 🌦️ 🌧️ ⛈️ 🌩️ 🌨️ ❄️ ☃️ ⛄ 🌬️ 🌪️ 🌈 ☔ ⚡ 🌙 🌛 🌝 🌞',
  },
  {
    id: 'objects',
    emojis:
      '⌚ 📱 💻 ⌨️ 🖥️ 🖨️ 🕹️ 📷 📸 📹 🎥 📞 ☎️ 📺 📻 🎙️ ⏰ ⏳ 🔋 🔌 💡 🔦 🕯️ 💸 💵 💰 💳 💎 🔧 🔨 🧰 🔑 🗝️ 🚪 🛋️ 🛏️ 🧸 🎁 🎈 🎏 🎀 🪄 🪅 🎎 🏮 🧧 ✉️ 📩 📦 🏷️ 📝 📚 📖 🔖 📌 📍 ✂️ 🖊️ ✏️ 🔍 🔒 🔓',
  },
  {
    id: 'symbols',
    emojis:
      '✅ ☑️ ✔️ ❌ ❎ ➕ ➖ ➗ ✖️ ♾️ ‼️ ⁉️ ❓ ❔ ❕ ❗ 〰️ 💱 💲 ⚕️ ♻️ ⚜️ 🔱 📛 🔰 ⭕ 🆗 🆒 🆕 🆓 🔝 🆙 🔴 🟠 🟡 🟢 🔵 🟣 ⚫ ⚪ 🟤 🔺 🔻 🔸 🔹 🔶 🔷 🔳 🔲 ▶️ ⏸️ ⏹️ ⏺️ ⏭️ ⏮️ 🔀 🔁 🔂 🎵 🎶 ➡️ ⬅️ ⬆️ ⬇️ ↗️ ↘️ ↙️ ↖️ 🔄 🔃',
  },
] as const;

export type EmojiGroupId = (typeof EMOJI_GROUPS)[number]['id'];

/** Tách chuỗi nhóm thành từng emoji — một lần, lúc nạp. */
export const EMOJI_LISTS: Readonly<Record<EmojiGroupId, readonly string[]>> = Object.fromEntries(
  EMOJI_GROUPS.map((g) => [g.id, g.emojis.split(' ')]),
) as unknown as Record<EmojiGroupId, readonly string[]>;

/**
 * Tin CHỈ có emoji (≤ 3 cái) thì vẽ to, không bong bóng — như Telegram. Đếm
 * theo cụm (❤️‍🔥 là một). Hermes không có `Intl.Segmenter` nên đếm bằng regex;
 * máy nào không hiểu `\p{…}` thì quay về cách thô: không chữ cái, ≤ 8 ký tự.
 */
const CLUSTER = safeRegex(
  '\\p{Extended_Pictographic}(?:\\ufe0f|\\p{Emoji_Modifier})*(?:\\u200d\\p{Extended_Pictographic}(?:\\ufe0f|\\p{Emoji_Modifier})*)*',
  'gu',
);
const WORDY = /[0-9A-Za-zÀ-ỹ]/;

function safeRegex(src: string, flags: string): RegExp | null {
  try {
    return new RegExp(src, flags);
  } catch {
    return null;
  }
}

export function bigEmojiCount(text: string): number {
  const t = text.trim();
  if (!t || WORDY.test(t)) return 0;
  if (!CLUSTER) return t.length <= 8 ? 1 : 0;
  const found = t.match(CLUSTER) ?? [];
  // Còn sót ký tự không phải emoji (dấu câu…) thì là một câu, không phải emoji trần.
  if (found.join('').replace(/\s/g, '').length !== t.replace(/\s/g, '').length) return 0;
  return found.length <= 3 ? found.length : 0;
}
