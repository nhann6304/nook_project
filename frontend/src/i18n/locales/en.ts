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
    headline: 'Live photos from your little nook',
    sub: 'Ten close friends. No likes, no strangers.',
    create: 'Get started',
    signIn: 'I already have one',
    notifyTitle: '{name} just sent one',
    notifySub: 'right on your home screen',
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

  profile: {
    title: "What's your name?",
    sub: 'Friends in your nook will see this name and photo.',
    nameLabel: 'Your name',
    namePlaceholder: 'Your name',
    usernameLabel: 'Username',
    usernamePlaceholder: 'username',
    usernameHint: 'Friends find you by this username.',
    usernameShort: 'Use at least 3 characters.',
    usernameChars: 'Only letters, numbers, dots and underscores.',
    taken: 'That username is taken. Try another one.',
    addPhoto: 'Add a profile photo',
    changePhoto: 'Change profile photo',
    continue: 'Continue',
  },

  person: {
    lockedTitle: 'This page is private',
    lockedMessage: "Only people in {name}'s nook can see more.",
    joined: 'On Nook since {month}',
    mutual: 'Mutual friends: {names}',
    noMutual: 'No mutual friends yet',
    invite: 'Invite to your nook',
    openPair: 'You and {name}',
    selfOpen: 'This is what others see about you. Make it private in Settings.',
    selfLocked: 'Private: people outside your nook only see your name, photo and @username.',
    noUsername: 'no username yet',
    notFound: "Couldn't find this person. They may have left Nook.",
  },

  privacy: {
    title: 'Privacy',
    lock: 'Private profile',
    lockHint: 'People outside your nook only see your name, photo and @username.',
  },

  nearby: {
    title: 'Nearby',
    entryHint: 'Meet people close by who have this open too',
    radius: 'Radius',
    meters: '{n} m',
    km: '{n} km',
    ruleMutual: 'Only people who also have Nearby open can see each other.',
    ruleNoSpot: 'Nobody sees where you are — only “within 500 m”.',
    ruleAutoOff: 'Turns off after 5 minutes, or as soon as you leave.',
    start: 'Search within {distance}',
    stop: 'Stop',
    liveTitle: 'Visible to people nearby',
    liveLeft: 'Turns off in {time}',
    within: '@{username} · within {distance}',
    inCircle: 'In your nook',
    emptyTitle: 'No one within {distance} yet',
    emptyMessage: 'Ask friends to open this too, or widen the radius.',
    deniedTitle: 'Location is off',
    deniedMessage: 'Allow location for Nook in your phone settings to find people nearby.',
    failed: "Couldn't get your location. Try again somewhere more open.",
  },

  sound: {
    title: 'Sound',
    label: 'Sounds for capture, send and reactions',
    hint: "Quiet, never stops your music. Silent on iPhone's silent mode.",
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
    shutter: 'Tap for a photo, hold for video',
    flip: 'Flip camera',
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
    tag: 'Tag friends in this photo',
    tagPerson: 'Tag {name}',
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

  friends: {
    title: 'Friends',
    slots: '{filled} / {total}',
    inviteTitle: 'Invite more friends',
    inviteLeft: { one: '{count} spot left in your nook', other: '{count} spots left in your nook' },
    full: 'Your nook is full',
    sendLink: 'Send link',
    shareMessage: 'Join my little nook on Nook: {link}',
    sentPhoto: 'Sent a photo {ago}',
    messaged: 'Messaged you {ago}',
    dormant: 'Quiet for a while · send one?',
    ringNote: 'The warmer the ring, the closer you are. Only you see this.',
    level: 'Level {level} · {name}',
    together: '{memories} memories · {days} days',
    toNext: '{count} memories to level {level}',
    message: 'Message',
    album: 'Shared album',
    albumSoon: 'Shared album is coming soon',
    photos: 'Photos between you two',
    noPhotos: 'No photos in the last 48 hours.',
    private: 'Only you and {name} can see this page.',
    more: 'More options',
    search: {
      placeholder: 'Search by name or @name',
      clear: 'Clear search',
      inCircle: 'In your nook',
      onNook: 'On Nook',
      add: 'Invite',
      requested: 'Invited',
      addLabel: 'Invite {name} to your nook',
      typeMore: 'Type one more letter to search Nook',
      noneTitle: 'No one called “{query}” yet',
      noneMessage: 'They may not be on Nook. Send them a link instead.',
      failed: "Couldn't send the invite. Please try again.",
    },
    invites: {
      title: 'Waiting for you',
      sub: '@{username} · {ago}',
      accept: 'Accept',
      acceptLabel: 'Accept invite from {name}',
      decline: 'Decline invite from {name}',
    },
    levels: {
      l1: 'Just started',
      l2: 'Getting to know',
      l3: 'Warming up',
      l4: 'Bonded',
      l5: 'Close',
      l6: 'Very close',
      l7: 'Tight',
      l8: 'Super tight',
      l9: 'Soulmates',
      l10: 'Inner nook',
    },
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

  home: {
    sentTagged: 'Sent · {names} will be notified',
    offline: 'Waiting for connection',
    mentioned: 'Mentions you',
    openFriends: 'Friends',
    openChats: 'Messages',
    friendsPill: { one: '{count} friend', other: '{count} friends' },
    inviteFirst: 'Invite your first',
    allFriends: 'All friends',
    sendToAll: { one: 'Send to {count} friend', other: 'Send to all {count}' },
    swipeHint: 'Swipe up for friends’ photos',
    grid: 'Grid view',
    backToCamera: 'Back to camera',
    sent: { one: 'Sent to {count} friend', other: 'Sent to {count} friends' },
    sentAlone: 'Kept — friends will see it when they join',
    endTitle: 'That’s all. Go shoot something.',
    endMessage: 'Photos friends sent in the last 48 hours show up here.',
    reacted: 'Sent to {name}',
    yours: 'Your photo',
    heart: 'Heart',
    laugh: 'Laugh',
    fire: 'Fire',
  },

  journal: {
    title: 'Your journal',
    open: 'Open your photo journal',
    summary: '{photos} photos · {days} days',
    weekdays: 'M,T,W,T,F,S,S',
    empty: 'Nothing sent yet. Your first photo lands here.',
    close: 'Close',
    photoOf: 'Photo from {day}',
    yearSummary: '{photos} photos · {days} days this year',
    monthCount: { one: '{count} photo', other: '{count} photos' },
    monthNone: 'Nothing yet',
    monthEmpty: 'No photos this month yet. Go take one.',
    wholeYear: 'All of {year}',
    prevYear: 'Previous year',
    nextYear: 'Next year',
    prevMonth: 'Previous month',
    nextMonth: 'Next month',
    openMonth: 'Open {month}',
  },

  history: {
    title: 'All photos',
    today: 'Today',
    earlier: 'Yesterday',
    open: 'Open {name}’s photo',
  },

  chat: {
    title: 'Messages',
    emptyTitle: 'No chats yet',
    emptyMessage: 'Tap the message box under a moment to start talking to whoever sent it.',
    openFeed: 'See moments',
    placeholder: 'Message {name}…',
    send: 'Send',
    noMessages: 'Nothing here yet. Say the first thing.',
    sentPhoto: 'From {name}',
    replyingTo: 'Replying to {name}’s photo',
    cancelReply: 'Cancel reply',
    openCamera: 'Reply with a photo',
    mineSaid: 'You: {text}',
  },

  theme: {
    title: 'Appearance',
    mode: 'Background',
    light: 'Light',
    dark: 'Dark',
    system: 'Phone',
    systemNote: 'Follows your phone’s light or dark mode.',
    locket: 'Locket colour',
    locketHint: 'Colours buttons, photo edges and friend rings. Photos keep their true colours.',
    denim: 'Blue',
    rose: 'Rose',
    sage: 'Sage',
    lavender: 'Lavender',
    apricot: 'Apricot',
  },
  account: {
    title: 'Account',
    signOut: 'Sign out',
    signOutHint: 'Your photos and friends stay put. Sign back in to see them.',
  },
  tabs: {
    label: 'Switch screen',
    home: 'Home',
    feed: 'Browse',
    settings: 'Settings',
  },
  me: {
    posts: 'photos, 30 days',
    friends: 'friends',
  },

  language: {
    title: 'Language',
    label: 'App language',
    system: 'Match my phone',
    systemNote: 'Following your phone’s language: {name}.',
  },

  errors: {
    app: {
      offline: 'The connection is shaky. Try again in a moment.',
      timeout: 'The network is slow and this didn’t go through. Try again.',
    },
    common: {
      bad_request: 'Something wasn’t quite right. Try again.',
      not_found: 'Couldn’t find that. Try again later.',
      rate_limited: 'That was quick. Wait a moment and try again.',
      payload_too_large: 'That file is too big. Pick a smaller one.',
      server_error: 'Nook is having trouble. Try again in a few minutes.',
      not_implemented: 'This isn’t open yet. Coming soon.',
    },
    auth: {
      code_invalid: 'That code doesn’t match. Try again.',
      code_expired: 'That code has expired. Tap resend for a new one.',
      code_locked: 'Too many tries. Tap resend for a new code.',
      code_too_soon: 'A code just went out. Wait a moment before asking again.',
      code_too_many: 'Too many codes asked for. Try again in an hour.',
      code_too_many_here: 'Too many codes from this phone. Try again in an hour.',
      verify_too_many_here: 'Too many wrong codes. Try again in an hour.',
      target_invalid: 'That email doesn’t look right. Check it again.',
      target_not_allowed: 'That email can’t get Nook’s mail. Use another one.',
      send_failed: 'Couldn’t send the code. Try again in a few minutes.',
      method_unavailable: 'That isn’t open yet. Use email instead.',
      account_not_found: 'No account with this email yet. Create one.',
      account_exists: 'This email already has an account. Sign in.',
      session_expired: 'It’s been a while. Sign in again.',
      session_revoked: 'You were signed out on this phone. Sign in again.',
      unauthorized: 'Please sign in again.',
      forbidden: 'You can’t open this.',
    },
    user: {
      not_found: 'Couldn’t find this person.',
      name_invalid: 'That name can’t be used. Try another.',
    },
    username: {
      invalid: 'Use plain letters, numbers, dots and underscores only.',
      reserved: 'Nook keeps that name. Try another.',
      taken: 'That name is taken. Try another.',
    },
    media: {
      not_found: 'Couldn’t find this photo.',
      type_unsupported: 'Nook can’t read this kind of file yet.',
      too_large: 'That file is too big. Pick a smaller one.',
      not_uploaded: 'The photo didn’t finish uploading. Send it again.',
      forbidden: 'You can’t see this photo.',
    },
  },
  notFound: {
    title: 'Nothing here',
    message: 'That link doesn’t go anywhere any more.',
    home: 'Back to the start',
  },
};
