/**
 * English.
 *
 * Kiểu `Mirror<typeof vi>` bắt buộc bộ khoá khớp y hệt `vi.ts` — thiếu một
 * khoá hay thừa một khoá đều không biên dịch được. Muốn thêm câu mới thì thêm
 * ở `vi.ts` trước, tsc sẽ chỉ ngay chỗ còn thiếu ở đây.
 *
 * Giọng văn: giữ đúng tinh thần bản tiếng Việt — thân, ngắn, không trịnh
 * trọng. Đây KHÔNG phải bản dịch từng chữ; câu tiếng Anh dài hơn câu tiếng
 * Việt cùng nghĩa khoảng 15–20%, nên chỗ nào chật thì viết ngắn lại chứ đừng
 * dịch sát rồi để nó tràn ra khỏi nút.
 *
 * Ba từ cấm bên tiếng Việt cũng cấm ở đây: "points", "rank", "quest/mission".
 * Không chữ kỹ thuật: "OTP", "verify", "valid", "token", "session".
 */
import type { Mirror } from '../types';
import type { vi } from './vi';

export const en: Mirror<typeof vi> = {
  common: {
    closeScreen: 'Close this screen',
    settings: 'Settings',
    openSettings: 'Open phone settings',
  },

  welcome: {
    headline: 'Live photos\nfrom your little nook',
    sub: 'Ten friends. No hearts, no view counts, no strangers.',
    create: 'Create an account',
    signIn: 'I already have one',
    firstMoment: 'your first moment',
  },

  signIn: {
    signupTitle: 'Make your nook',
    signupSub: 'We’ll send you a six-digit code so we know it’s really you.',
    signupCta: 'Continue',
    signinTitle: 'Welcome back',
    signinSub: 'Use the same email or phone number as last time.',
    signinCta: 'Send me a code',

    methodLabel: 'How to get the code',
    email: 'Email',
    phone: 'Phone',
    emailPlaceholder: 'you@gmail.com',
    phonePlaceholder: '912 345 678',

    badEmail: 'That email doesn’t look right. Mind checking it?',
    badPhone: 'That number doesn’t look right. Vietnamese mobiles have 10 digits.',
    terms: 'Tapping “Continue” means you agree to Nook’s Terms of Service and Privacy Policy.',
  },

  verify: {
    title: 'Code sent',
    sub: 'Six digits are on their way to {target}.',
    checking: 'Checking…',
    codeLabel: { one: 'A {count}-digit code', other: 'A {count}-digit code' },
    wrongCode: 'That code doesn’t match. Give it another go.',
    resendIn: 'Send again in {seconds}s',
    resend: 'Send a new code',
    otherEmail: 'Use a different email',
    otherPhone: 'Use a different number',
  },

  camera: {
    openCircle: 'Your nook',
    openSettings: 'Settings',
    gallery: 'Pick a photo you already have',
    flash: 'Turn the light on or off',
    shutter: 'Take a moment',
    flip: 'Flip camera',
    peekEmpty: 'No moments yet',
    peekSome: { one: 'Moments · {count}', other: 'Moments · {count}' },
    peekHint: 'Photos only go to the people in your nook.',
    captionHint: 'Add a line…',

    permission: {
      title: 'Nook needs the camera',
      message:
        'So you can capture moments for your friends. Photos only go to the people in your nook — nowhere else.',
      allow: 'Allow camera',

      blockedTitle: 'Camera is off',
      blockedMessage:
        'You turned the camera off for Nook, and your phone won’t ask again. Turn it back on in your phone settings under Nook, then come back here.',

      skip: 'See your friends’ moments',
    },
  },

  review: {
    discard: 'Discard this one',
    sendTo: {
      one: 'Send to {count} person in your nook',
      other: 'Send to {count} people in your nook',
    },
    sendToNobody: 'Nobody in your nook to send to yet',
    captionPlaceholder: 'Add a line…',
    captionLabel: 'Add a line to this photo',
    privacy: {
      one: 'This photo only goes to {count} person in your nook. Nobody else can see it.',
      other: 'This photo only goes to {count} people in your nook. Nobody else can see it.',
    },
    send: 'Send',
  },

  feed: {
    title: 'Moments',
    emptyTitle: 'All caught up. Go shoot something.',
    emptyMessage:
      'When friends in your nook send a photo, it shows up here. Want to send the first one?',
    openCamera: 'Open camera',
    window: 'Only the last 48 hours.',
    replyTo: 'Message {name}…',
    replied: 'Sent to {name}',
    justNow: 'just now',
    minutesAgo: { one: '{count} minute ago', other: '{count} minutes ago' },
    hoursAgo: { one: '{count} hour ago', other: '{count} hours ago' },
    daysAgo: { one: '{count} day ago', other: '{count} days ago' },
  },

  circle: {
    title: 'Your nook',
    slots: '{filled} / {total} spots',
    emptySlot: 'Empty spot',
    waitingTitle: {
      one: 'One more spot to fill',
      other: '{count} more spots to fill',
    },
    waitingMessage: 'Invite your first friend. Only ten spots, so choose well.',
    invite: 'Invite a friend',
  },

  theme: {
    title: 'Colours',
    label: 'App colour set',
    note: 'Changes right away. Every set is measured so text stays readable.',
    terracotta: 'Terracotta',
    moss: 'Moss',
    deepsea: 'Deep sea',
    dusk: 'Dusk',
    neutral: 'Neutral',
  },

  language: {
    title: 'Language',
    label: 'App language',
    system: 'Match my phone',
    systemNote: 'Following your phone’s language: {name}.',
  },

  notFound: {
    title: 'Nothing here',
    message: 'That link doesn’t go anywhere any more.',
    home: 'Back to the start',
  },
};
