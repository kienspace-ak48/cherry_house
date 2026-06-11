const userRepository = require('../repositories/user.repository');
const promoCodeService = require('./promoCode.service');
const mailService = require('./mail.service');
const emailTemplateService = require('./emailTemplate.service');
const { EMAIL_TEMPLATE_KEYS } = require('../config/emailTemplate.defaults');
const { getClientAppUrl } = require('../config/appUrl.config');
const { httpError, parseId } = require('../utils/http');

function formatDateVi(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('vi-VN');
}

function formatDiscountText(promo) {
  if (promo.discountType === 'fixed_amount') {
    return `Giảm ${Number(promo.discountAmountVnd || 0).toLocaleString('vi-VN')} ₫`;
  }
  return `Giảm ${promo.discountPercent || 0}%`;
}

function formatMinOrderText(promo) {
  const min = Number(promo.minSubtotalVnd || 0);
  if (!min) return 'Không yêu cầu';
  return `Từ ${min.toLocaleString('vi-VN')} ₫`;
}

function parseUserIds(raw) {
  if (!Array.isArray(raw) || !raw.length) {
    throw httpError('Chọn ít nhất một khách hàng', 400);
  }
  const ids = [...new Set(raw.map((id) => parseId(id, 'userId')))];
  if (!ids.length) throw httpError('Danh sách khách hàng không hợp lệ', 400);
  return ids;
}

function parseCustomPayload(body = {}) {
  const subject = String(body.subject || '').trim();
  const eventName = String(body.eventName || '').trim();
  const content1 = String(body.content1 || '').trim();
  const content2 = String(body.content2 || '').trim();
  const ctaLabel = String(body.ctaLabel || '').trim();
  const ctaUrl = String(body.ctaUrl || '').trim();
  const showCta = body.showCta === true || body.showCta === 'true' || body.showCta === 'on' || body.showCta === '1';

  if (!subject) throw httpError('Tiêu đề email là bắt buộc', 400);
  if (!eventName) throw httpError('Tiêu đề trong email là bắt buộc', 400);
  if (!content1) throw httpError('Nội dung email là bắt buộc', 400);
  if (showCta && (!ctaLabel || !ctaUrl)) {
    throw httpError('Nút CTA cần nhãn và đường dẫn', 400);
  }

  return {
    subject,
    eventName,
    content1,
    content2,
    showCta,
    ctaLabel: showCta ? ctaLabel : '',
    ctaUrl: showCta ? ctaUrl : getClientAppUrl(),
  };
}

async function loadPromo(promoCodeIdRaw) {
  const promo = await promoCodeService.getById(promoCodeIdRaw);
  if (!promo) throw httpError('Mã giảm giá không tồn tại', 404);
  if (!promo.isActive) throw httpError('Mã giảm giá đang tắt', 400);
  return promo;
}

async function sendCustomToUser(user, payload) {
  const vars = {
    guest_name: user.fullName,
    full_name: user.fullName,
    cta_url: payload.showCta ? payload.ctaUrl : '',
  };
  const rendered = await emailTemplateService.render(
    EMAIL_TEMPLATE_KEYS.MARKETING_CUSTOM,
    vars,
    {
      subjectOverride: payload.subject,
      configOverrides: {
        eventName: payload.eventName,
        content1: payload.content1,
        content2: payload.content2,
        showCta: payload.showCta,
        ctaLabel: payload.ctaLabel || 'Xem chi tiết',
        showDetailTable: false,
      },
    },
  );
  return mailService.sendMail({
    to: user.email,
    subject: rendered.subject,
    text: rendered.text,
    html: rendered.html,
  });
}

async function sendPromoToUser(user, promo) {
  const ctaUrl = `${getClientAppUrl()}/booking`;
  return mailService.sendPromoCoupon({
    to: user.email,
    guestName: user.fullName,
    couponCode: promo.code,
    discountText: formatDiscountText(promo),
    minOrderText: formatMinOrderText(promo),
    validFrom: formatDateVi(promo.validFrom),
    validTo: formatDateVi(promo.validTo),
    description: promo.description || '',
    ctaUrl,
  });
}

/**
 * Gửi email cho danh sách khách hàng đã chọn.
 * @returns {{ sent: number, failed: number, skipped: number, results: Array }}
 */
async function sendBulk({ userIds, emailType, customPayload, promoCodeId }) {
  const ids = parseUserIds(userIds);
  const users = await userRepository.findByIds(ids);
  const userMap = new Map(users.map((u) => [u.id, u]));

  let promo = null;
  if (emailType === 'promo') {
    if (!promoCodeId) throw httpError('Chọn mã giảm giá', 400);
    promo = await loadPromo(promoCodeId);
  } else if (emailType === 'custom') {
    parseCustomPayload(customPayload);
  } else {
    throw httpError('Loại email không hợp lệ', 400);
  }

  const custom = emailType === 'custom' ? parseCustomPayload(customPayload) : null;
  const results = [];
  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const id of ids) {
    const user = userMap.get(id);
    if (!user) {
      skipped += 1;
      results.push({ userId: id, status: 'skipped', message: 'Không tìm thấy tài khoản' });
      continue;
    }
    if (!user.isActive) {
      skipped += 1;
      results.push({ userId: id, email: user.email, status: 'skipped', message: 'Tài khoản đã khóa' });
      continue;
    }
    if (!user.email) {
      skipped += 1;
      results.push({ userId: id, status: 'skipped', message: 'Không có email' });
      continue;
    }

    try {
      const outcome = emailType === 'promo'
        ? await sendPromoToUser(user, promo)
        : await sendCustomToUser(user, custom);

      if (outcome.success) {
        sent += 1;
        results.push({
          userId: id,
          email: user.email,
          fullName: user.fullName,
          status: 'sent',
          messageId: outcome.message_id,
        });
      } else {
        failed += 1;
        results.push({
          userId: id,
          email: user.email,
          fullName: user.fullName,
          status: 'failed',
          message: outcome.message || 'Gửi thất bại',
        });
      }
    } catch (error) {
      failed += 1;
      results.push({
        userId: id,
        email: user.email,
        fullName: user.fullName,
        status: 'failed',
        message: error.message || 'Gửi thất bại',
      });
    }
  }

  return { sent, failed, skipped, total: ids.length, results };
}

module.exports = {
  sendBulk,
  formatDiscountText,
  formatMinOrderText,
  formatDateVi,
};
