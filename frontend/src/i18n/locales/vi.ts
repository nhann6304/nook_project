/**
 * Tiếng Việt — BỘ CHỮ GỐC.
 *
 * File này là nguồn chuẩn: mọi khoá sinh ra ở đây trước, `en.ts` chạy theo.
 * Thêm khoá vào đây mà chưa dịch sang `en.ts` là tsc báo đỏ ngay — không có
 * cách nào để một câu chưa dịch lọt lên máy người dùng.
 *
 * Luật viết chữ (đầy đủ trong .claude/skills/nook-ui/SKILL.md):
 *   · Cấm ba từ: "điểm", "hạng", "nhiệm vụ".
 *   · Cấm chữ kỹ thuật: "OTP", "xác thực", "hợp lệ", "token", "phiên".
 *   · Xưng "mình" với người dùng, gọi họ là "bạn". Không "quý khách", không
 *     "người dùng".
 *   · Câu lỗi phải nói ĐƯỢC PHẢI LÀM GÌ, không chỉ nói cái gì hỏng.
 *
 * Chỗ trống viết trong ngoặc nhọn: "Gửi lại sau {seconds} giây". Tên chỗ trống
 * là một phần của kiểu — đổi tên ở đây là chỗ gọi t() báo đỏ.
 */

export const vi = {
  /* ---------- Dùng chung nhiều màn ---------- */
  common: {
    closeScreen: 'Đóng màn này',
    settings: 'Cài đặt',
    openSettings: 'Mở Cài đặt máy',
  },

  /* ---------- Màn 0 — Giới thiệu (lần mở đầu tiên) ---------- */
  intro: {
    skip: 'Bỏ qua',
    next: 'Tiếp',
    start: 'Bắt đầu thôi',
    pages: 'Trang {index} trên {total}',
    s1Title: 'Chụp một tấm, bạn thân thấy ngay',
    s1Body: 'Ảnh hiện thẳng trên máy bạn bè — nguyên vẹn như lúc bạn chụp, không cắt, không nén.',
    s2Title: 'Chỉ mười người thân nhất',
    s2Body: 'Không người lạ, không lượt thích. Góc nhỏ chỉ dành cho những người bạn thật sự quý.',
    s3Title: 'Mỗi lần qua lại là một ký ức',
    s3Body: 'Ảnh gửi đi, lời đáp lại — tất cả xếp thành cuốn lịch của riêng hai người.',
  },

  /* ---------- Tour chỉ nút — lần đầu vào màn Chụp ---------- */
  tour: {
    skip: 'Bỏ qua',
    next: 'Tiếp',
    done: 'Mình hiểu rồi',
    step: '{index}/{total}',
    shutterTitle: 'Nút chụp',
    shutterBody: 'Chạm để chụp, giữ để quay một đoạn ngắn. Chụp xong là gửi thẳng tới bạn bè.',
    friendsTitle: 'Bạn bè của bạn',
    friendsBody: 'Mời, nhận lời và xem ai đang trong góc của bạn — tối đa mười người.',
    historyTitle: 'Ảnh bạn bè gửi',
    historyBody: 'Chạm vào đây hoặc vuốt lên để xem ảnh mới nhất của mọi người.',
    bellTitle: 'Thông báo',
    bellBody: 'Lời mời kết bạn, ai vừa nhắc tới bạn, ai thả cảm xúc — đều ở đây.',
    meTitle: 'Trang của bạn',
    meBody: 'Ảnh đại diện, mã QR để bạn bè quét, và toàn bộ cài đặt.',
    memoriesTitle: 'Ký ức',
    memoriesBody: 'Lịch ảnh theo từng tháng. Vuốt sang phải cũng tới.',
    chatsTitle: 'Tin nhắn',
    chatsBody: 'Trò chuyện riêng với từng người, đổi được nền cho mỗi cuộc. Vuốt sang trái cũng tới.',
  },

  /* ---------- Màn 1 — Chào mừng ---------- */
  welcome: {
    headline: 'Ảnh trực tiếp từ góc nhỏ của mình',
    sub: 'Mười người bạn thân. Không lượt thích, không người lạ.',
    create: 'Bắt đầu',
    signIn: 'Mình đã có tài khoản',
    notifyTitle: '{name} vừa gửi',
    notifySub: 'trên màn hình chủ của bạn',
  },

  /* ---------- Màn 2 — Đăng nhập / Tạo tài khoản ---------- */
  signIn: {
    signupTitle: 'Tạo góc của bạn',
    signupSub: 'Chúng mình gửi bạn một mã sáu số để xác nhận đây đúng là bạn.',
    signupCta: 'Tiếp tục',
    signinTitle: 'Chào bạn quay lại',
    signinSub: 'Nhập lại email hoặc số điện thoại bạn đã dùng lần trước.',
    signinCta: 'Gửi mã cho mình',

    methodLabel: 'Cách nhận mã',
    email: 'Email',
    phone: 'Số điện thoại',
    emailPlaceholder: 'ban@gmail.com',
    phonePlaceholder: '912 345 678',

    badEmail: 'Email này trông chưa đúng. Bạn xem lại giúp mình nhé.',
    badPhone: 'Số này chưa đúng. Số di động Việt Nam có 10 chữ số.',
    terms: 'Chạm “Tiếp tục” là bạn đồng ý với Điều khoản dịch vụ và Chính sách riêng tư của LOVO.',
  },

  /* ---------- Màn 3 — Nhập mã ---------- */
  profile: {
    title: 'Bạn tên gì?',
    sub: 'Bạn bè trong góc sẽ thấy tên và ảnh này.',
    nameLabel: 'Tên của bạn',
    namePlaceholder: 'Tên của bạn',
    usernameLabel: 'Tên riêng',
    usernamePlaceholder: 'tenrieng',
    usernameHint: 'Bạn bè tìm bạn bằng tên riêng này.',
    usernameShort: 'Tên riêng cần ít nhất 3 ký tự.',
    usernameChars: 'Chỉ dùng chữ không dấu, số, dấu chấm và gạch dưới.',
    taken: 'Tên riêng này có người dùng rồi. Bạn thử tên khác nhé.',
    addPhoto: 'Thêm ảnh đại diện',
    changePhoto: 'Đổi ảnh đại diện',
    continue: 'Tiếp tục',
  },

  person: {
    lockedTitle: 'Trang này đã khoá',
    lockedMessage: 'Chỉ bạn trong góc của {name} mới xem được thêm.',
    joined: 'Ở LOVO từ {month}',
    mutual: 'Bạn chung: {names}',
    noMutual: 'Chưa có bạn chung',
    invite: 'Mời vào góc',
    openPair: 'Trang riêng của bạn và {name}',
    selfOpen: 'Đây là trang người khác thấy về bạn. Khoá trang trong Cài đặt.',
    selfLocked: 'Trang đang khoá: người ngoài góc chỉ thấy tên, ảnh và @tên.',
    noUsername: 'chưa có tên riêng',
    notFound: 'Không tìm thấy người này. Có thể họ đã rời LOVO.',
  },

  privacy: {
    title: 'Riêng tư',
    lock: 'Khoá trang cá nhân',
    lockHint: 'Người ngoài góc chỉ thấy tên, ảnh và @tên của bạn.',
  },

  nearby: {
    heroTitle: 'Bật định vị để khám phá bạn bè xung quanh bạn',
    enable: 'Bật định vị',
    withinChip: 'Trong bán kính {distance}',
    away: 'Cách bạn dưới {distance}',
    openNow: 'Đang mở',
    viewProfile: 'Xem trang',
    noMatch: 'Không ai quanh đây khớp tên này.',
    search: 'Tìm tên hoặc @tên',
    title: 'Tìm quanh đây',
    entryHint: 'Gặp người ở gần cũng đang mở màn này',
    radius: 'Bán kính',
    meters: '{n} m',
    km: '{n} km',
    ruleMutual: 'Chỉ người cũng đang mở “Tìm quanh đây” mới thấy nhau.',
    ruleNoSpot: 'Không ai thấy vị trí của bạn — chỉ thấy “dưới 200 m”.',
    ruleAutoOff: 'Tự tắt sau 5 phút, hoặc ngay khi bạn rời màn này.',
    start: 'Bật tìm trong {distance}',
    stop: 'Tắt',
    liveTitle: 'Đang hiện bạn với người quanh đây',
    liveLeft: 'Tự tắt sau {time}',
    within: '@{username} · dưới {distance}',
    inCircle: 'Trong góc',
    emptyTitle: 'Chưa thấy ai trong {distance}',
    emptyMessage: 'Rủ bạn bè cùng mở màn này, hoặc nới rộng bán kính.',
    deniedTitle: 'Chưa có quyền vị trí',
    deniedMessage: 'Bật vị trí cho LOVO trong Cài đặt máy để tìm người quanh đây.',
    failed: 'Chưa lấy được vị trí. Bạn ra chỗ thoáng hơn rồi thử lại nhé.',
  },

  sound: {
    title: 'Âm thanh',
    label: 'Tiếng khi chụp, gửi và thả cảm xúc',
    hint: 'Nhỏ, không ngắt nhạc bạn đang nghe. iPhone để im lặng thì im.',
  },

  verify: {
    title: 'Mã đã gửi rồi nhé',
    sub: 'Sáu số vừa được gửi tới {target}.',
    checking: 'Đang kiểm tra…',
    codeLabel: { other: 'Mã gồm {count} chữ số' },
    wrongCode: 'Mã không đúng. Bạn thử nhập lại nhé.',
    resendIn: 'Gửi lại sau {seconds} giây',
    resend: 'Gửi lại mã',
    otherEmail: 'Dùng email khác',
    otherPhone: 'Dùng số khác',
  },

  /* ---------- Màn 7 — Camera ---------- */
  camera: {
    zoom: 'Đổi mức zoom',
    openCircle: 'Góc của bạn',
    openSettings: 'Cài đặt',
    gallery: 'Chọn ảnh có sẵn',
    flash: 'Bật tắt đèn',
    shutter: 'Chạm để chụp, giữ để quay',
    flip: 'Đổi camera trước sau',
    peekHint: 'Ảnh chỉ đi tới những người trong góc của bạn.',
    captionHint: 'Thêm một dòng…',

    permission: {
      /* Chưa hỏi lần nào: giải thích LÝ DO trước, rồi mới bung hộp thoại máy. */
      title: 'LOVO cần camera',
      message:
        'Để bạn chụp khoảnh khắc gửi cho bạn bè. Ảnh chỉ đi tới những người trong góc của bạn, không đi đâu khác.',
      allow: 'Cho phép camera',

      /* Đã từ chối: hộp thoại máy KHÔNG bung lại nữa, phải vào Cài đặt máy. */
      blockedTitle: 'Camera đang tắt',
      blockedMessage:
        'Bạn đã tắt camera cho LOVO. Máy sẽ không hỏi lại nữa — mở lại trong Cài đặt máy, phần LOVO, rồi quay về đây.',

      skip: 'Xem khoảnh khắc của bạn bè',
    },
  },

  /* ---------- Màn 8 — Vừa chụp xong ---------- */
  review: {
    discard: 'Bỏ tấm này',
    /* Không khai `one`: tiếng Việt không đổi dạng theo số. Xem types.ts. */
    sendTo: { other: 'Gửi cho {count} người trong góc' },
    sendToNobody: 'Chưa có ai trong góc để gửi',
    captionPlaceholder: 'Thêm một dòng…',
    captionLabel: 'Thêm một dòng cho ảnh',
    tag: 'Tag bạn vào ảnh',
    tagPerson: 'Tag {name}',
    privacy: {
      other: 'Ảnh này chỉ đi tới {count} người trong góc của bạn. Không ai khác thấy được.',
    },
    send: 'Gửi đi',
  },

  /* ---------- Màn 9 — Khoảnh khắc ---------- */
  feed: {
    title: 'Khoảnh khắc',
    emptyTitle: 'Hết rồi. Chụp gì đó đi.',
    emptyMessage: 'Khi bạn bè trong góc gửi ảnh, chúng hiện ở đây. Bạn gửi trước một tấm nhé?',
    openCamera: 'Mở camera',
    window: 'Chỉ hiện 48 giờ gần nhất.',
    replyTo: 'Nhắn riêng cho {name}…',
    replied: 'Đã nhắn cho {name}',
    justNow: 'vừa xong',
    minutesAgo: { other: '{count} phút trước' },
    hoursAgo: { other: '{count} giờ trước' },
    daysAgo: { other: '{count} ngày trước' },
  },

  /* ---------- Bạn bè (C12) + trang một người bạn (C14) ---------- */
  friends: {
    title: 'Bạn bè',
    slots: '{filled} / {total}',
    inviteTitle: 'Mời thêm bạn',
    inviteLeft: { other: 'Còn {count} chỗ trong góc' },
    full: 'Góc đã đủ mười người',
    sendLink: 'Gửi link',
    myQr: 'Mã QR',
    shareMessage: 'Vào góc nhỏ của mình trên LOVO nhé: {link}',
    sentPhoto: 'Gửi ảnh {ago}',
    messaged: 'Nhắn cho bạn {ago}',
    dormant: 'Lâu rồi chưa có gì mới · gửi một tấm?',
    ringNote: 'Vòng càng ấm là càng thân. Chỉ bạn thấy màu này.',
    level: 'Cấp {level} · {name}',
    together: '{memories} ký ức · {days} ngày',
    toNext: 'Còn {count} ký ức tới cấp {level}',
    tierPill: '{tier} · {name}',
    bracelet: 'Vòng tay của hai đứa',
    braceletThicker: 'Mỗi hạt là một ký ức. Thêm {count} ký ức nữa là vòng dày thêm.',
    braceletUpgrade: 'Mỗi hạt là một ký ức. Thêm {count} ký ức nữa là hạt hoá {material}.',
    braceletDone: 'Vòng vàng đủ hạt — thứ hiếm nhất ở LOVO.',
    tier: {
      wood: 'Vòng gỗ',
      shell: 'Vòng vỏ sò',
      ours: 'Vòng màu riêng',
      jade: 'Vòng ngọc',
      gold: 'Vòng vàng',
    },
    material: {
      wood: 'gỗ',
      shell: 'vỏ sò',
      ours: 'màu riêng của hai đứa',
      jade: 'ngọc',
      gold: 'vàng',
    },
    message: 'Nhắn tin',
    album: 'Album chung',
    albumSoon: 'Album chung sắp có',
    photos: 'Ảnh của hai bạn',
    noPhotos: 'Chưa có ảnh nào trong 48 giờ qua.',
    private: 'Chỉ bạn và {name} thấy trang này.',
    more: 'Tuỳ chọn thêm',
    search: {
      placeholder: 'Tìm theo tên hoặc @tên',
      clear: 'Xoá chữ đã gõ',
      inCircle: 'Trong góc của bạn',
      onNook: 'Trên LOVO',
      add: 'Mời',
      requested: 'Đã mời',
      addLabel: 'Mời {name} vào góc',
      typeMore: 'Gõ thêm một chữ để tìm trên LOVO',
      noneTitle: 'Chưa thấy ai tên “{query}”',
      noneMessage: 'Có thể họ chưa dùng LOVO. Gửi link để rủ họ vào nhé.',
      failed: 'Chưa gửi được lời mời. Bạn thử lại giúp mình nhé.',
    },
    invites: {
      title: 'Lời mời đang chờ',
      sub: '@{username} · {ago}',
      accept: 'Nhận lời',
      acceptLabel: 'Nhận lời mời của {name}',
      decline: 'Từ chối lời mời của {name}',
    },
    levels: {
      l1: 'Bắt đầu',
      l2: 'Quen',
      l3: 'Thân dần',
      l4: 'Gắn bó',
      l5: 'Thân',
      l6: 'Rất thân',
      l7: 'Thân thiết',
      l8: 'Cực thân',
      l9: 'Tri kỷ',
      l10: 'Góc trong',
    },
  },

  /* ---------- Màn 11 — Góc của bạn ---------- */
  circle: {
    title: 'Góc của bạn',
    slots: '{filled} / {total} chỗ',
    emptySlot: 'Chỗ còn trống',
    waitingTitle: { other: 'Góc này còn chờ {count} người' },
    waitingMessage: 'Mời người đầu tiên vào đi. Chỉ mười chỗ thôi, nên chọn kỹ nhé.',
    invite: 'Mời một người bạn',
  },

  /* ---------- Màn chính: camera + ảnh bạn bè lướt dọc ---------- */
  home: {
    history: 'Lịch sử',
    openMe: 'Trang của bạn và cài đặt',
    sentTagged: 'Đã gửi · đã báo cho {names}',
    offline: 'Đang chờ mạng',
    mentioned: 'Nhắc tới bạn',
    openFriends: 'Bạn bè',
    openChats: 'Tin nhắn',
    friendsPill: { other: '{count} Bạn bè' },
    inviteFirst: 'Mời bạn đầu tiên',
    allFriends: 'Tất cả bạn bè',
    sendToAll: { other: 'Gửi cho cả {count} bạn' },
    swipeHint: 'Vuốt lên xem ảnh bạn bè',
    grid: 'Xem dạng lưới',
    backToCamera: 'Về camera',
    sent: { other: 'Đã gửi cho {count} bạn' },
    sentAlone: 'Đã giữ lại — bạn bè vào là thấy',
    endTitle: 'Hết rồi. Chụp gì đó đi.',
    endMessage: 'Ảnh bạn bè gửi trong 48 giờ gần nhất sẽ hiện ở đây.',
    reacted: 'Đã gửi cho {name}',
    yours: 'Ảnh của bạn',
    heart: 'Thả tim',
    laugh: 'Cười',
    fire: 'Cháy quá',
  },

  /* ---------- Nhật ký ảnh của mình ---------- */
  memories: {
    title: 'Ký ức',
  },

  journal: {
    title: 'Nhật ký của bạn',
    open: 'Mở nhật ký ảnh của bạn',
    summary: '{photos} tấm · {days} ngày có ảnh',
    weekdays: 'T2,T3,T4,T5,T6,T7,CN',
    empty: 'Chưa gửi tấm nào. Tấm đầu tiên sẽ nằm ở đây.',
    close: 'Đóng',
    photoOf: 'Ảnh ngày {day}',
    yearSummary: '{photos} tấm · {days} ngày có ảnh trong năm',
    monthCount: { other: '{count} tấm' },
    monthNone: 'Chưa có',
    monthEmpty: 'Tháng này chưa có tấm nào. Chụp một tấm đi.',
    wholeYear: 'Cả năm {year}',
    prevYear: 'Năm trước',
    nextYear: 'Năm sau',
    prevMonth: 'Tháng trước',
    nextMonth: 'Tháng sau',
    openMonth: 'Mở {month}',
  },

  /* ---------- Tất cả ảnh (lưới) ---------- */
  history: {
    title: 'Tất cả ảnh',
    today: 'Hôm nay',
    earlier: 'Hôm qua',
    open: 'Mở ảnh của {name}',
  },

  /* ---------- Trò chuyện ---------- */
  chat: {
    title: 'Tin nhắn',
    emptyTitle: 'Chưa nói chuyện với ai',
    emptyMessage: 'Chạm vào ô nhắn dưới một khoảnh khắc là mở được cuộc trò chuyện với người gửi.',
    openFeed: 'Xem khoảnh khắc',
    placeholder: 'Nhắn cho {name}…',
    send: 'Gửi',
    noMessages: 'Chưa có tin nào. Bạn nói câu đầu tiên nhé.',
    sentPhoto: '{name} gửi',
    replyingTo: 'Trả lời ảnh của {name}',
    cancelReply: 'Bỏ trả lời ảnh này',
    openCamera: 'Trả lời bằng ảnh',
    mineSaid: 'Bạn: {text}',
    you: 'Bạn',
    online: 'đang hoạt động',
    lastSeenRecently: 'mới truy cập gần đây',
    typing: 'đang gõ…',
    today: 'Hôm nay',
    yesterday: 'Hôm qua',
    sticker: 'Sticker',
    photo: 'Ảnh',
    replyTo: 'Trả lời {name}',
    keyboard: 'Mở bàn phím',
    emojiPanel: 'Mở emoji và sticker',
    emoji: 'Emoji',
    stickers: 'Sticker',
    background: 'Đổi nền',
    backgroundTitle: 'Nền trò chuyện',
    backgroundHint: 'Chỉ bạn thấy nền này — {name} vẫn giữ nền của họ.',
    search: 'Tìm cuộc trò chuyện',
    wallpaper: {
      default: 'Theo trời',
      sky: 'Trời xanh',
      sunset: 'Hoàng hôn',
      mint: 'Bạc hà',
      lavender: 'Oải hương',
      peach: 'Đào',
      night: 'Đêm sao',
      doodle: 'Hoạ tiết',
    },
    emojiCat: {
      smileys: 'Mặt cười',
      gestures: 'Cử chỉ & người',
      hearts: 'Trái tim',
      animals: 'Động vật & cây',
      food: 'Đồ ăn',
      activity: 'Hoạt động',
      travel: 'Du lịch & trời',
      objects: 'Đồ vật',
      symbols: 'Ký hiệu',
    },
  },

  /* ---------- Màu sắc ---------- */
  theme: {
    title: 'Giao diện',
    mode: 'Nền',
    light: 'Sáng',
    dark: 'Tối',
    system: 'Theo máy',
    systemNote: 'Tự đổi theo chế độ sáng, tối của điện thoại.',
    sky: 'Theo trời',
    skyNote:
      'Màu đổi theo buổi trong ngày; trời mưa thì chuyển sang màu mưa. Ảnh luôn giữ màu thật.',
    dawn: 'Sáng',
    noon: 'Trưa',
    dusk: 'Chiều',
    night: 'Tối',
    rain: 'Mưa',
    now: 'bây giờ',
    rainOn: 'Cho LOVO biết trời mưa',
    rainHint: 'Dùng vị trí thô (khoảng 10 km) để hỏi dự báo. Không lưu, không gửi cho ai.',
    rainReady: 'Đã bật: trời mưa là màu đổi theo.',
    locket: 'Màu locket',
    locketHint:
      '"Theo ảnh": app tự lấy màu từ tấm bạn gửi gần nhất — chụp hoàng hôn là app ngả cam. Ảnh thì luôn giữ màu thật.',
    photo: 'Theo ảnh',
    denim: 'Lam',
    rose: 'Hồng',
    sage: 'Lá',
    lavender: 'Oải hương',
    apricot: 'Mơ',
  },
  account: {
    title: 'Tài khoản',
    signOut: 'Đăng xuất',
    signOutHint: 'Ảnh và bạn bè vẫn còn nguyên, đăng nhập lại là thấy.',
  },
  audience: {
    title: 'Ai được xem',
    all: 'Tất cả',
    hiddenPerson: '{name} — không xem được',
    settingsTitle: 'Người xem mặc định',
    settingsHint:
      'Bạn nào bị bỏ chọn sẽ không thấy ảnh mới của bạn. Lúc gửi vẫn đổi được từng tấm.',
    empty: 'Góc của bạn chưa có ai.',
    search: 'Tìm',
    searchPlaceholder: 'Tìm tên bạn bè',
    done: 'Xong',
    shown: 'Được xem',
    hidden: 'Không xem được',
    noMatch: 'Không có ai tên như vậy trong góc.',
  },
  notify: {
    title: 'Thông báo',
    open: 'Mở thông báo',
    fresh: 'Mới',
    earlier: 'Trước đó',
    invite: 'mời bạn vào góc của họ',
    accepted: 'đã nhận lời, giờ hai bạn chung góc',
    tagged: 'nhắc tới bạn trong một ảnh',
    reacted: 'thả {emoji} vào ảnh của bạn',
    replied: 'nhắn về ảnh của bạn: “{text}”',
    emptyTitle: 'Chưa có gì mới',
    emptyMessage: 'Khi bạn bè thả cảm xúc, nhắc tới bạn hay mời bạn, nó sẽ hiện ở đây.',
  },
  /* ---------- LOVO Pro (nhánh thử) ---------- */
  pro: {
    title: 'LOVO Pro',
    tagline: 'cho những ai muốn giữ kỷ niệm thật đẹp',
    card: 'LOVO Pro',
    cardSub: '{price}/tháng · dùng thử {days} ngày',
    vnd: '{amount}đ',
    perMonth: 'chỉ {price}/tháng',
    cancelAnytime: 'huỷ lúc nào cũng được',
    save: 'Tiết kiệm 17%',
    plan: { month: 'Theo tháng', year: 'Theo năm' },
    start: 'Dùng thử {days} ngày miễn phí',
    soon: 'Sắp mở — thanh toán qua App Store và Google Play.',
    perk: {
      beads: {
        title: 'Hạt vòng đặc biệt',
        sub: 'Pha lê, ngọc trai, đá mặt trăng cho vòng tay với bạn thân.',
      },
      icon: {
        title: 'Icon app & khung ảnh riêng',
        sub: 'Đổi icon LOVO, khung ảnh, chữ viết tay nhiều màu.',
      },
      video: { title: 'Video 10 giây', sub: 'Giữ nút chụp lâu hơn — bản thường là 3 giây.' },
      recap: {
        title: 'Recap có nhạc',
        sub: 'Video kỷ niệm theo tháng, theo năm cho từng người bạn.',
      },
      pin: { title: 'Ghim bạn thân', sub: 'Ảnh của họ luôn nằm đầu tiên.' },
      gift: { title: 'Tặng một tháng Pro', sub: 'Cho một người bạn, mỗi năm một lần.' },
    },
    freeTitle: 'Ai cũng có, không cần Pro',
    free: {
      photo: 'Ảnh chất lượng gốc — không bóp, không nén nát.',
      memories: 'Mọi kỷ niệm giữ mãi, không giới hạn.',
      bracelet: 'Vòng tay và độ thân không bao giờ mua được.',
      friends: 'Chỗ cho bạn bè không bán — chỉ mở thêm khi hai người thân thật.',
    },
  },

  /* ---------- Mã QR ---------- */
  qr: {
    hint: 'Bạn bè quét mã này bằng camera là thêm được bạn trên LOVO.',
    share: 'Chia sẻ link',
    shareMessage: 'Thêm mình trên LOVO nhé: {link}',
    open: 'Mã QR của bạn',
  },

  settings: {
    replayTour: 'Xem lại hướng dẫn',
    appearance: 'Giao diện',
    privacy: 'Riêng tư',
    language: 'Ngôn ngữ',
    back: 'Quay lại',
    save: 'Lưu',
    mode: 'Màu nền',
    locket: 'Màu locket',
    preview: 'Xem trước',
    previewCaption: '{scene} · {accent}',
    previewButton: 'Gửi ảnh',
    lightHint: 'Nền trắng, lam nhạt — cả ngày như nhau.',
    darkHint: 'Nền navy, dịu mắt khi trời tối.',
    on: 'Bật',
    off: 'Tắt',
    pageOpen: 'Trang mở',
    pageLocked: 'Trang khoá',
    everyone: 'Ai trong góc cũng xem',
    hiddenCount: { other: '{count} người bị ẩn' },
    followPhone: 'Theo máy',
    followPhoneHint: 'Đổi theo ngôn ngữ điện thoại.',
  },
  tabs: {
    memories: 'Ký ức',
    label: 'Chuyển màn',
    home: 'Chụp',
    friends: 'Bạn bè',
    chats: 'Tin nhắn',
    settings: 'Cài đặt',
  },
  me: {
    posts: 'ảnh 30 ngày',
    friends: 'bạn trong góc',
  },

  /* ---------- Ngôn ngữ ---------- */
  language: {
    title: 'Ngôn ngữ',
    label: 'Chữ trong app',
    system: 'Theo máy',
    systemNote: 'Đang theo ngôn ngữ máy của bạn: {name}.',
  },

  /* ---------- Đường dẫn hỏng ---------- */
  errors: {
    app: {
      offline: 'Mạng đang chập chờn. Thử lại giúp mình nhé.',
      timeout: 'Mạng chậm quá, chưa gửi được. Thử lại nhé.',
    },
    common: {
      bad_request: 'Có gì đó chưa đúng. Bạn thử lại nhé.',
      not_found: 'Không tìm thấy thứ bạn cần. Thử lại sau nhé.',
      rate_limited: 'Bạn thao tác nhanh quá. Chờ một chút rồi thử lại nhé.',
      payload_too_large: 'Tệp nặng quá. Bạn chọn tệp nhỏ hơn nhé.',
      server_error: 'LOVO đang trục trặc. Thử lại sau ít phút nhé.',
      not_implemented: 'Phần này chưa mở. Chờ bản sau nhé.',
    },
    auth: {
      code_invalid: 'Mã không đúng. Bạn thử nhập lại nhé.',
      code_expired: 'Mã hết hạn rồi. Bấm gửi lại để nhận mã mới nhé.',
      code_locked: 'Sai nhiều lần quá. Bấm gửi lại để nhận mã mới nhé.',
      code_too_soon: 'Mã vừa gửi xong. Chờ chút rồi xin mã mới nhé.',
      code_too_many: 'Bạn xin mã nhiều quá. Thử lại sau một giờ nhé.',
      code_too_many_here: 'Máy này xin mã nhiều quá. Thử lại sau một giờ nhé.',
      verify_too_many_here: 'Nhập sai nhiều quá. Thử lại sau một giờ nhé.',
      target_invalid: 'Email này chưa đúng dạng. Bạn xem lại nhé.',
      target_not_allowed: 'Email này không nhận được thư của LOVO. Bạn dùng email khác nhé.',
      send_failed: 'Chưa gửi được mã. Thử lại sau ít phút nhé.',
      method_unavailable: 'Cách này chưa mở. Bạn dùng email nhé.',
      account_not_found: 'Chưa có tài khoản nào như vậy — mình chuyển sang tạo mới, bạn bấm tiếp nhé.',
      account_exists: 'Bạn đã có tài khoản rồi — mình chuyển sang đăng nhập, bạn bấm tiếp nhé.',
      session_expired: 'Lâu rồi bạn chưa vào. Đăng nhập lại nhé.',
      session_revoked: 'Bạn đã đăng xuất trên máy này. Đăng nhập lại nhé.',
      unauthorized: 'Bạn cần đăng nhập lại nhé.',
      forbidden: 'Bạn không mở được phần này.',
    },
    user: {
      not_found: 'Không tìm thấy người này.',
      name_invalid: 'Tên này chưa dùng được. Bạn thử tên khác nhé.',
    },
    username: {
      invalid: 'Chỉ dùng chữ không dấu, số, dấu chấm và gạch dưới.',
      reserved: 'Tên riêng này LOVO giữ lại. Bạn thử tên khác nhé.',
      taken: 'Tên riêng này có người dùng rồi. Bạn thử tên khác nhé.',
    },
    media: {
      not_found: 'Không tìm thấy ảnh này.',
      type_unsupported: 'LOVO chưa đọc được loại tệp này.',
      too_large: 'Tệp nặng quá. Bạn chọn tệp nhỏ hơn nhé.',
      not_uploaded: 'Ảnh chưa lên hết. Thử gửi lại nhé.',
      forbidden: 'Bạn không xem được ảnh này.',
    },
  },
  notFound: {
    title: 'Không tìm thấy trang này',
    message: 'Đường dẫn bạn vừa mở không còn nữa.',
    home: 'Về màn chính',
  },
} as const;
