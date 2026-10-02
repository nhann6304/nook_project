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
    terms: 'Chạm “Tiếp tục” là bạn đồng ý với Điều khoản dịch vụ và Chính sách riêng tư của Nook.',
  },

  /* ---------- Màn 3 — Nhập mã ---------- */
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
    openCircle: 'Góc của bạn',
    openSettings: 'Cài đặt',
    gallery: 'Chọn ảnh có sẵn',
    flash: 'Bật tắt đèn',
    shutter: 'Chụp khoảnh khắc',
    flip: 'Đổi camera trước sau',
    peekHint: 'Ảnh chỉ đi tới những người trong góc của bạn.',
    captionHint: 'Thêm một dòng…',

    permission: {
      /* Chưa hỏi lần nào: giải thích LÝ DO trước, rồi mới bung hộp thoại máy. */
      title: 'Nook cần camera',
      message:
        'Để bạn chụp khoảnh khắc gửi cho bạn bè. Ảnh chỉ đi tới những người trong góc của bạn, không đi đâu khác.',
      allow: 'Cho phép camera',

      /* Đã từ chối: hộp thoại máy KHÔNG bung lại nữa, phải vào Cài đặt máy. */
      blockedTitle: 'Camera đang tắt',
      blockedMessage:
        'Bạn đã tắt camera cho Nook. Máy sẽ không hỏi lại nữa — mở lại trong Cài đặt máy, phần Nook, rồi quay về đây.',

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
    privacy: { other: 'Ảnh này chỉ đi tới {count} người trong góc của bạn. Không ai khác thấy được.' },
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
    shareMessage: 'Vào góc nhỏ của mình trên Nook nhé: {link}',
    sentPhoto: 'Gửi ảnh {ago}',
    messaged: 'Nhắn cho bạn {ago}',
    dormant: 'Lâu rồi chưa có gì mới · gửi một tấm?',
    ringNote: 'Vòng càng ấm là càng thân. Chỉ bạn thấy màu này.',
    level: 'Cấp {level} · {name}',
    together: '{memories} ký ức · {days} ngày',
    toNext: 'Còn {count} ký ức tới cấp {level}',
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
      onNook: 'Trên Nook',
      add: 'Mời',
      requested: 'Đã mời',
      addLabel: 'Mời {name} vào góc',
      typeMore: 'Gõ thêm một chữ để tìm trên Nook',
      noneTitle: 'Chưa thấy ai tên “{query}”',
      noneMessage: 'Có thể họ chưa dùng Nook. Gửi link để rủ họ vào nhé.',
      failed: 'Chưa gửi được lời mời. Bạn thử lại giúp mình nhé.',
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
    openFriends: 'Bạn bè',
    openChats: 'Tin nhắn',
    friendsPill: { other: '{count} bạn' },
    inviteFirst: 'Mời bạn đầu tiên',
    allFriends: 'Tất cả bạn bè',
    sendToAll: { other: 'Gửi cho cả {count} bạn' },
    swipeHint: 'Vuốt lên xem ảnh bạn bè',
    grid: 'Xem dạng lưới',
    backToCamera: 'Về camera',
    more: 'Thêm',
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
    emptyMessage:
      'Chạm vào ô nhắn dưới một khoảnh khắc là mở được cuộc trò chuyện với người gửi.',
    openFeed: 'Xem khoảnh khắc',
    placeholder: 'Nhắn cho {name}…',
    send: 'Gửi',
    noMessages: 'Chưa có tin nào. Bạn nói câu đầu tiên nhé.',
    sentPhoto: '{name} gửi',
    replyingTo: 'Trả lời ảnh của {name}',
    cancelReply: 'Bỏ trả lời ảnh này',
    openCamera: 'Trả lời bằng ảnh',
    mineSaid: 'Bạn: {text}',
  },

  /* ---------- Màu sắc ---------- */
  theme: {
    title: 'Màu sắc',
    label: 'Bảng màu của app',
    note: 'Đổi là thấy ngay. Bảng nào cũng đã đo để chữ đọc được rõ.',
    mode: 'Cách chọn màu',
    auto: 'Tự động',
    fixed: 'Cố định',
    autoNote: 'Màu tự đổi theo giờ trong ngày, như bầu trời ngoài cửa sổ. Ảnh thì luôn giữ đúng màu thật.',
    fixedNote: 'Giữ một bảng màu, không đổi theo giờ.',
    now: 'bây giờ',
    skyDawn: 'Sáng',
    skyNoon: 'Trưa',
    skyDusk: 'Chiều tối',
    skyNight: 'Đêm',
    terracotta: 'Đất nung',
    moss: 'Rêu',
    deepsea: 'Biển đêm',
    dusk: 'Hoàng hôn',
    neutral: 'Trung tính',
  },

  /* ---------- Ngôn ngữ ---------- */
  language: {
    title: 'Ngôn ngữ',
    label: 'Chữ trong app',
    system: 'Theo máy',
    systemNote: 'Đang theo ngôn ngữ máy của bạn: {name}.',
  },

  /* ---------- Đường dẫn hỏng ---------- */
  notFound: {
    title: 'Không tìm thấy trang này',
    message: 'Đường dẫn bạn vừa mở không còn nữa.',
    home: 'Về màn chính',
  },
} as const;
