function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Thay {{key}} trong chuỗi — giá trị đã escape HTML */
function interpolate(template, vars = {}) {
  if (!template) return '';
  return String(template).replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_m, key) => {
    if (vars[key] === undefined || vars[key] === null) return '';
    return escapeHtml(String(vars[key]));
  });
}

function buildBannerBlock(config) {
  const mode = config.bannerMode || 'color';
  if (mode === 'none') return '';
  if (mode === 'image' && config.bannerImageUrl) {
    return `<tr><td style="padding:0;line-height:0;">
      <img src="${escapeHtml(config.bannerImageUrl)}" alt="" width="100%" style="display:block;max-height:160px;object-fit:cover;">
    </td></tr>`;
  }
  const bg = config.bannerColor || '#a82e42';
  const text = escapeHtml(config.bannerText || 'Cherry House');
  return `<tr><td align="center" style="padding:28px 16px;background:${escapeHtml(bg)};color:#fff;font-family:Arial,Helvetica,sans-serif;">
    <div style="font-size:22px;font-weight:bold;letter-spacing:.5px;">${text}</div>
  </td></tr>`;
}

function buildDetailRow(label, value, altBg) {
  if (!value) return '';
  return `<tr${altBg ? ' style="background:#f9f9f9"' : ''}>
    <td style="padding:8px 6px;border:1px solid #ddd;white-space:nowrap;vertical-align:middle;font-size:11px;"><b>${escapeHtml(label)}</b></td>
    <td style="padding:8px 6px;border:1px solid #ddd;font-size:12px;word-wrap:break-word;">${escapeHtml(value)}</td>
  </tr>`;
}

function buildBookingDetailTable(vars) {
  const rows = [
    ['Mã đặt phòng', vars.booking_code, false],
    ['Cơ sở', vars.property_name, true],
    ['Chi nhánh', vars.branch_name, false],
    ['Phòng', vars.room_code, true],
    ['Nhận phòng', vars.check_in, false],
    ['Trả phòng', `${vars.check_out} (${vars.nights} đêm)`, true],
    ['Số khách', vars.guest_line, false],
    ['Điện thoại', vars.guest_phone, true],
    ['Email', vars.guest_email, false],
    ['Giá / đêm', vars.price_per_night, true],
    ['Tổng thanh toán', vars.total_vnd, false],
  ];
  if (vars.special_note) rows.push(['Ghi chú', vars.special_note, true]);

  const trs = rows
    .filter(([, v]) => v)
    .map(([label, value], i) => buildDetailRow(label, value, i % 2 === 1))
    .join('');

  return `<div style="padding:4px 0 8px 0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:12px;table-layout:fixed;">
      <colgroup><col style="width:50%" /><col style="width:50%" /></colgroup>
      ${trs}
    </table>
  </div>`;
}

function buildPromoDetailTable(vars) {
  const rows = [
    ['Mã coupon', vars.coupon_code, false],
    ['Ưu đãi', vars.discount_text, true],
    ['Đơn tối thiểu', vars.min_order_text, false],
    ['Hiệu lực từ', vars.valid_from, true],
    ['Hiệu lực đến', vars.valid_to, false],
    ['Mô tả', vars.description, true],
  ];
  const trs = rows
    .filter(([, v]) => v)
    .map(([label, value], i) => buildDetailRow(label, value, i % 2 === 1))
    .join('');
  return `<div style="padding:4px 0 8px 0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:12px;">
      ${trs}
    </table>
  </div>`;
}

function buildQrSection(config, vars) {
  if (!config.showQr || !vars.qr_code_data_url) return '';
  const intro = interpolate(config.qrIntro || '', vars);
  const caption = interpolate(config.qrCaption || '', vars);
  const fallback = interpolate(config.qrFallback || '', vars);
  let html = '';
  if (intro) html += `<p style="margin:12px 0 8px;font-size:12px;text-align:center;">${intro}</p>`;
  html += `<p align="center" style="margin:12px 0">
    <img src="${vars.qr_code_data_url}" width="200" alt="QR" style="display:block;margin:0 auto;border:4px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.08);" />
  </p>`;
  if (fallback) html += `<p style="margin:8px 0;font-size:11px;text-align:center;color:#666;">${fallback}</p>`;
  if (caption) html += `<p style="margin:8px 0 0;font-size:11px;text-align:center;color:#888;">${caption}</p>`;
  return html;
}

function buildOtpHighlight(vars) {
  if (!vars.otp_code) return '';
  return `<p align="center" style="margin:16px 0;font-size:28px;font-weight:bold;letter-spacing:6px;color:#a82e42;">${escapeHtml(vars.otp_code)}</p>`;
}

function buildCtaBlock(config, vars) {
  if (!config.showCta || !vars.cta_url) return '';
  const label = interpolate(config.ctaLabel || 'Xem chi tiết', vars);
  return `<p align="center" style="margin:20px 0;">
    <a href="${escapeHtml(vars.cta_url)}" style="display:inline-block;background:#a82e42;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:bold;font-size:13px;">${label}</a>
  </p>`;
}

const EMAIL_SHELL = `<body style="margin:40px 0;padding:0;background:#f4f6f8">
<table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f4f6f8">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;background:#ffffff">
{{banner_block}}
<tr>
<td style="padding:16px 12px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#333333">
<h1 style="margin:0 0 8px 0;font-size:18px;line-height:1.25;font-weight:bold" align="center">{{event_name}}</h1>
<p style="margin:0 0 12px 0;font-size:12px">{{greeting_line}}</p>
<div style="font-size:12px;line-height:1.45;margin-bottom:12px">{{content_1}}</div>
{{otp_highlight_block}}
{{detail_table_block}}
{{qr_section_block}}
{{cta_block}}
<div style="font-size:12px;line-height:1.45;margin-top:10px">{{content_2}}</div>
</td>
</tr>
<tr>
<td style="padding:16px 14px;background-color:{{footer_bg_color}};color:{{footer_text_color}};font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.5;">
{{footer_body}}
</td>
</tr>
</table>
</td></tr>
</table>
</body>`;

/**
 * @param {object} config — từ admin (đã parse JSON)
 * @param {object} runtimeVars — dữ liệu động khi gửi
 * @param {object} options
 * @param {'booking_confirmation'|'registration_otp'|'promo_coupon'} options.templateKey
 */
function renderEmailHtml(config, runtimeVars, { templateKey } = {}) {
  const vars = { ...runtimeVars };
  const greetingName = vars.guest_name || vars.full_name || vars.greeting_name || 'Quý khách';
  const greetingPrefix = interpolate(config.greetingPrefix || 'Xin chào', vars);

  let detailTable = '';
  if (config.showDetailTable) {
    if (templateKey === 'promo_coupon') {
      detailTable = buildPromoDetailTable(vars);
    } else if (templateKey === 'booking_confirmation') {
      detailTable = buildBookingDetailTable(vars);
    }
  }

  const replacements = {
    banner_block: buildBannerBlock(config),
    event_name: interpolate(config.eventName || '', vars),
    greeting_line: `${greetingPrefix} <b>${escapeHtml(greetingName)}</b>,`,
    content_1: interpolate(config.content1 || '', vars),
    content_2: interpolate(config.content2 || '', vars),
    otp_highlight_block: config.otpHighlight ? buildOtpHighlight(vars) : '',
    detail_table_block: detailTable,
    qr_section_block: buildQrSection(config, vars),
    cta_block: buildCtaBlock(config, vars),
    footer_bg_color: escapeHtml(config.footerBgColor || '#5c1a28'),
    footer_text_color: escapeHtml(config.footerTextColor || '#ffffff'),
    footer_body: String(config.footerBody || '')
      .replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_m, key) => escapeHtml(vars[key] ?? ''))
      .replace(/\n/g, '<br>'),
  };

  let html = EMAIL_SHELL;
  Object.entries(replacements).forEach(([key, value]) => {
    html = html.split(`{{${key}}}`).join(value ?? '');
  });
  return html;
}

function renderSubject(subjectTemplate, vars) {
  return interpolate(subjectTemplate, vars).replace(/&amp;/g, '&');
}

function buildPlainText(config, vars, { templateKey } = {}) {
  const lines = [
    interpolate(config.eventName || '', vars),
    `${interpolate(config.greetingPrefix || 'Xin chào', vars)} ${vars.guest_name || vars.full_name || ''},`,
    '',
    interpolate(config.content1 || '', vars).replace(/<[^>]+>/g, ''),
  ];
  if (templateKey === 'booking_confirmation') {
    lines.push(`Mã: ${vars.booking_code}`, `Phòng: ${vars.room_code}`, `Tổng: ${vars.total_vnd}`);
    if (vars.result_url) lines.push(`Chi tiết: ${vars.result_url}`);
  }
  if (templateKey === 'registration_otp') {
    lines.push(`OTP: ${vars.otp_code}`);
  }
  if (templateKey === 'promo_coupon') {
    lines.push(`Mã: ${vars.coupon_code}`, vars.discount_text);
  }
  if (templateKey === 'marketing_custom' && vars.cta_url) {
    lines.push(`Liên kết: ${vars.cta_url}`);
  }
  lines.push('', interpolate(config.content2 || '', vars).replace(/<[^>]+>/g, ''));
  return lines.filter((l) => l !== undefined).join('\n');
}

module.exports = {
  escapeHtml,
  interpolate,
  renderEmailHtml,
  renderSubject,
  buildPlainText,
};
