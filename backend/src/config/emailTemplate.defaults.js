/** Loại email — key dùng trong DB và khi gửi */
const EMAIL_TEMPLATE_KEYS = {
  BOOKING_CONFIRMATION: 'booking_confirmation',
  REGISTRATION_OTP: 'registration_otp',
  PROMO_COUPON: 'promo_coupon',
  MARKETING_CUSTOM: 'marketing_custom',
};

const TEMPLATE_META = [
  {
    key: EMAIL_TEMPLATE_KEYS.BOOKING_CONFIRMATION,
    name: 'Xác nhận đặt phòng',
    description: 'Gửi khi khách thanh toán thành công — kèm mã QR check-in.',
    variables: [
      'guest_name', 'booking_code', 'property_name', 'branch_name', 'room_code',
      'check_in', 'check_out', 'nights', 'guest_line', 'guest_phone', 'guest_email',
      'total_vnd', 'price_per_night', 'special_note', 'result_url',
    ],
  },
  {
    key: EMAIL_TEMPLATE_KEYS.REGISTRATION_OTP,
    name: 'Mã OTP đăng ký',
    description: 'Gửi khi khách đăng ký tài khoản — xác thực email.',
    variables: ['full_name', 'otp_code'],
  },
  {
    key: EMAIL_TEMPLATE_KEYS.PROMO_COUPON,
    name: 'Thông báo mã giảm giá',
    description: 'Gửi coupon / mã khuyến mãi cho khách hàng.',
    variables: [
      'guest_name', 'coupon_code', 'discount_text', 'min_order_text',
      'valid_from', 'valid_to', 'description',
    ],
  },
  {
    key: EMAIL_TEMPLATE_KEYS.MARKETING_CUSTOM,
    name: 'Email marketing tùy chỉnh',
    description: 'Gửi thông báo / ưu đãi tùy chỉnh cho khách hàng (admin chọn người nhận).',
    variables: ['guest_name'],
  },
];

function defaultConfig(key) {
  const sharedFooter = {
    footerBgColor: '#5c1a28',
    footerTextColor: '#ffffff',
    footerBody: 'Cherry House · Homestay & Mini Hotel<br>Liên hệ lễ tân nếu cần hỗ trợ.',
  };

  if (key === EMAIL_TEMPLATE_KEYS.BOOKING_CONFIRMATION) {
    return {
      bannerMode: 'color',
      bannerColor: '#a82e42',
      bannerImageUrl: '',
      bannerText: 'Cherry House',
      eventName: 'Đặt phòng thành công',
      greetingPrefix: 'Xin chào',
      content1: 'Cảm ơn bạn đã đặt phòng tại Cherry House. Dưới đây là thông tin đặt phòng của bạn:',
      content2: 'Check-in 14:00 · Check-out 12:00. Vui lòng xuất trình mã QR hoặc mã đặt phòng tại lễ tân khi nhận phòng.',
      showQr: true,
      qrIntro: 'Mã QR check-in tại lễ tân',
      qrCaption: 'Hoặc cung cấp mã đặt phòng cho nhân viên.',
      qrFallback: '',
      showCta: true,
      ctaLabel: 'Xem đơn đặt phòng',
      showDetailTable: true,
      ...sharedFooter,
    };
  }

  if (key === EMAIL_TEMPLATE_KEYS.REGISTRATION_OTP) {
    return {
      bannerMode: 'color',
      bannerColor: '#a82e42',
      bannerImageUrl: '',
      bannerText: 'Cherry House',
      eventName: 'Xác thực đăng ký',
      greetingPrefix: 'Xin chào',
      content1: 'Mã OTP của bạn (hiệu lực 10 phút):',
      content2: 'Nếu bạn không yêu cầu đăng ký, hãy bỏ qua email này.',
      showQr: false,
      qrIntro: '',
      qrCaption: '',
      qrFallback: '',
      showCta: false,
      ctaLabel: '',
      showDetailTable: false,
      otpHighlight: true,
      ...sharedFooter,
    };
  }

  if (key === EMAIL_TEMPLATE_KEYS.PROMO_COUPON) {
    return {
      bannerMode: 'color',
      bannerColor: '#c45c26',
      bannerImageUrl: '',
      bannerText: 'Ưu đãi Cherry House',
      eventName: 'Mã giảm giá dành cho bạn',
      greetingPrefix: 'Xin chào',
      content1: 'Cherry House gửi bạn mã ưu đãi đặc biệt. Áp dụng khi thanh toán trên website.',
      content2: 'Mã có thể hết hạn hoặc giới hạn lượt dùng — đặt phòng sớm để không bỏ lỡ.',
      showQr: false,
      qrIntro: '',
      qrCaption: '',
      qrFallback: '',
      showCta: true,
      ctaLabel: 'Đặt phòng ngay',
      showDetailTable: true,
      ...sharedFooter,
    };
  }

  if (key === EMAIL_TEMPLATE_KEYS.MARKETING_CUSTOM) {
    return {
      bannerMode: 'color',
      bannerColor: '#a82e42',
      bannerImageUrl: '',
      bannerText: 'Cherry House',
      eventName: 'Thông báo từ Cherry House',
      greetingPrefix: 'Xin chào',
      content1: 'Cherry House có tin vui dành cho bạn.',
      content2: 'Cảm ơn bạn đã tin tưởng và đồng hành cùng Cherry House.',
      showQr: false,
      qrIntro: '',
      qrCaption: '',
      qrFallback: '',
      showCta: true,
      ctaLabel: 'Đặt phòng ngay',
      showDetailTable: false,
      ...sharedFooter,
    };
  }

  return { ...sharedFooter };
}

function defaultSubject(key) {
  const map = {
    [EMAIL_TEMPLATE_KEYS.BOOKING_CONFIRMATION]: '[Cherry House] Xác nhận đặt phòng {{booking_code}}',
    [EMAIL_TEMPLATE_KEYS.REGISTRATION_OTP]: 'Mã xác thực đăng ký Cherry House',
    [EMAIL_TEMPLATE_KEYS.PROMO_COUPON]: '[Cherry House] Mã giảm giá {{coupon_code}} dành cho bạn',
    [EMAIL_TEMPLATE_KEYS.MARKETING_CUSTOM]: '[Cherry House] {{guest_name}} — tin từ Cherry House',
  };
  return map[key] || '[Cherry House] Thông báo';
}

function buildDefaultTemplates() {
  return TEMPLATE_META.map((meta) => ({
    templateKey: meta.key,
    name: meta.name,
    description: meta.description,
    subject: defaultSubject(meta.key),
    configJson: JSON.stringify(defaultConfig(meta.key)),
    isEnabled: true,
  }));
}

module.exports = {
  EMAIL_TEMPLATE_KEYS,
  TEMPLATE_META,
  defaultConfig,
  defaultSubject,
  buildDefaultTemplates,
};
