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
    continue: 'Tiếp tục',
    back: 'Quay lại',
    cancel: 'Huỷ',
    close: 'Đóng',
    closeScreen: 'Đóng màn này',
    retry: 'Thử lại',
    notNow: 'Để sau',
    settings: 'Cài đặt',
    openSettings: 'Mở Cài đặt máy',
  },

  /* ---------- Màn 1 — Chào mừng ---------- */
  welcome: {
    headline: 'Ảnh trực tiếp\ntừ góc nhỏ của mình',
    sub: 'Mười người bạn. Không tim, không lượt xem, không người lạ.',
    create: 'Tạo tài khoản',
    signIn: 'Mình đã có tài khoản',
    firstMoment: 'khoảnh khắc đầu tiên',
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
    circlePill: 'Góc của bạn · {count}',
    openCircle: 'Góc của bạn',
    openSettings: 'Cài đặt',
    shutter: 'Chụp khoảnh khắc',
    flip: 'Đổi camera trước sau',
    moments: 'Khoảnh khắc',
    openMoments: 'Xem khoảnh khắc của bạn bè',
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

      asking: 'Đang chờ bạn trả lời…',
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
    send: 'Gửi đi',
    sending: 'Đang gửi…',
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
    mine: 'Bạn',
    justNow: 'vừa xong',
    minutesAgo: { other: '{count} phút trước' },
    hoursAgo: { other: '{count} giờ trước' },
    daysAgo: { other: '{count} ngày trước' },
  },

  /* ---------- Màn 11 — Góc của bạn ---------- */
  circle: {
    title: 'Góc của bạn',
    slots: '{filled} / {total} chỗ',
    emptySlot: 'Chỗ còn trống',
    waitingTitle: { other: 'Góc này còn chờ {count} người' },
    waitingMessage: 'Mời người đầu tiên vào đi. Chỉ mười chỗ thôi, nên chọn kỹ nhé.',
    invite: 'Mời một người bạn',
    dormant: 'Lâu rồi chưa gặp',
    level: 'Cấp {level}',
  },

  /* ---------- Ngôn ngữ ---------- */
  language: {
    title: 'Ngôn ngữ',
    label: 'Chữ trong app',
    vi: 'Tiếng Việt',
    en: 'English',
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
