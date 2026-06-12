const promoPopupRepository = require('../repositories/promoPopup.repository');
const promoCodeRepository = require('../repositories/promoCode.repository');
const { parseId } = require('../utils/http');

const SELECTION_MODES = new Set(['manual', 'by_type']);
const DISCOUNT_FILTERS = new Set(['all', 'percent', 'fixed_amount']);

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function isDateInRange(validFrom, validTo, today = startOfToday()) {
  const from = new Date(validFrom);
  const to = new Date(validTo);
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);
  return today >= from && today <= to;
}

function isPromoEligible(promo, today = startOfToday()) {
  if (!promo?.isActive) return false;
  if (!isDateInRange(promo.validFrom, promo.validTo, today)) return false;
  if (promo.maxUses != null && promo.usedCount >= promo.maxUses) return false;
  return true;
}

function formatDiscountLabel(promo) {
  if (!promo) return '';
  if (promo.discountType === 'fixed_amount') {
    const amount = Number(promo.discountAmountVnd || 0);
    return `Giảm ${amount.toLocaleString('vi-VN')}đ`;
  }
  const percent = Number(promo.discountPercent || 0);
  return `Giảm ${percent}%`;
}

function formatValidTo(validTo) {
  const d = new Date(validTo);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function comparePromos(a, b) {
  const toA = new Date(a.validTo).getTime();
  const toB = new Date(b.validTo).getTime();
  if (toA !== toB) return toA - toB;

  if (a.discountType === 'percent' && b.discountType === 'percent') {
    return Number(b.discountPercent || 0) - Number(a.discountPercent || 0);
  }
  if (a.discountType === 'fixed_amount' && b.discountType === 'fixed_amount') {
    return Number(b.discountAmountVnd || 0) - Number(a.discountAmountVnd || 0);
  }
  if (a.discountType === 'percent') return -1;
  if (b.discountType === 'percent') return 1;
  return 0;
}

async function listEligiblePromos(discountTypeFilter = 'all') {
  const rows = await promoCodeRepository.findAll({ isActive: true });
  const filter = DISCOUNT_FILTERS.has(discountTypeFilter) ? discountTypeFilter : 'all';
  return rows
    .filter((p) => isPromoEligible(p))
    .filter((p) => filter === 'all' || p.discountType === filter)
    .sort(comparePromos);
}

async function resolveFeaturedPromo(settings) {
  if (!settings?.isEnabled) return null;

  if (settings.selectionMode === 'manual') {
    if (!settings.promoCodeId) return null;
    const promo = settings.promoCode || (await promoCodeRepository.findById(settings.promoCodeId));
    return isPromoEligible(promo) ? promo : null;
  }

  if (settings.selectionMode === 'by_type') {
    const eligible = await listEligiblePromos(settings.discountTypeFilter);
    return eligible[0] || null;
  }

  return null;
}

function toPublicPromo(promo) {
  if (!promo) return null;
  return {
    code: promo.code,
    discountType: promo.discountType,
    discountLabel: formatDiscountLabel(promo),
    minSubtotalVnd: promo.minSubtotalVnd,
    validTo: formatValidTo(promo.validTo),
  };
}

function parseShowOnRoutes(raw) {
  if (Array.isArray(raw)) {
    return raw.map((r) => String(r).trim()).filter(Boolean);
  }
  if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map((r) => String(r).trim()).filter(Boolean);
    } catch {
      return raw.split(',').map((r) => r.trim()).filter(Boolean);
    }
  }
  return ['all'];
}

function buildDefaultSettings() {
  return {
    isEnabled: false,
    selectionMode: 'manual',
    promoCodeId: null,
    discountTypeFilter: 'all',
    title: 'Ưu đãi Cherry House',
    message: null,
    ctaLabel: 'Sao chép mã',
    delaySec: 2,
    dismissHours: 24,
    showOnRoutesJson: JSON.stringify(['all']),
  };
}

async function ensureDefaults() {
  const existing = await promoPopupRepository.getSettings();
  if (existing) return;
  await promoPopupRepository.upsertSettings(buildDefaultSettings());
}

async function getPublicConfig() {
  await ensureDefaults();
  const settings = await promoPopupRepository.getSettings();
  const promo = await resolveFeaturedPromo(settings);

  if (!settings?.isEnabled || !promo) {
    return {
      enabled: false,
      title: settings?.title || buildDefaultSettings().title,
      message: settings?.message || null,
      ctaLabel: settings?.ctaLabel || buildDefaultSettings().ctaLabel,
      delaySec: settings?.delaySec ?? 2,
      dismissHours: settings?.dismissHours ?? 24,
      showOnRoutes: parseShowOnRoutes(settings?.showOnRoutesJson),
      promo: null,
    };
  }

  const message = settings.message?.trim()
    || promo.description?.trim()
    || formatDiscountLabel(promo);

  return {
    enabled: true,
    title: settings.title || buildDefaultSettings().title,
    message,
    ctaLabel: settings.ctaLabel || buildDefaultSettings().ctaLabel,
    delaySec: Math.max(0, Number(settings.delaySec) || 0),
    dismissHours: Math.max(1, Number(settings.dismissHours) || 24),
    showOnRoutes: parseShowOnRoutes(settings.showOnRoutesJson),
    promo: toPublicPromo(promo),
  };
}

async function getAdminSettings() {
  await ensureDefaults();
  return promoPopupRepository.getSettings();
}

function parseFormBody(body) {
  const selectionMode = String(body.selectionMode || 'manual').trim();
  const discountTypeFilter = String(body.discountTypeFilter || 'all').trim();

  const routeFlags = {
    all: body.routeAll === '1' || body.routeAll === true || body.routeAll === 'on',
    home: body.routeHome === '1' || body.routeHome === true || body.routeHome === 'on',
    booking: body.routeBooking === '1' || body.routeBooking === true || body.routeBooking === 'on',
    checkout: body.routeCheckout === '1' || body.routeCheckout === true || body.routeCheckout === 'on',
  };

  let showOnRoutes = ['all'];
  if (!routeFlags.all) {
    showOnRoutes = [];
    if (routeFlags.home) showOnRoutes.push('/');
    if (routeFlags.booking) showOnRoutes.push('/booking');
    if (routeFlags.checkout) showOnRoutes.push('/checkout');
    if (!showOnRoutes.length) showOnRoutes = ['all'];
  }

  const promoCodeIdRaw = body.promoCodeId;
  let promoCodeId = null;
  if (promoCodeIdRaw != null && String(promoCodeIdRaw).trim() !== '') {
    promoCodeId = parseId(promoCodeIdRaw);
  }

  return {
    isEnabled: body.isEnabled === '1' || body.isEnabled === true || body.isEnabled === 'on',
    selectionMode: SELECTION_MODES.has(selectionMode) ? selectionMode : 'manual',
    promoCodeId: selectionMode === 'manual' ? promoCodeId : null,
    discountTypeFilter: DISCOUNT_FILTERS.has(discountTypeFilter) ? discountTypeFilter : 'all',
    title: String(body.title || '').trim().slice(0, 255) || buildDefaultSettings().title,
    message: String(body.message || '').trim() || null,
    ctaLabel: String(body.ctaLabel || '').trim().slice(0, 80) || buildDefaultSettings().ctaLabel,
    delaySec: Math.min(Math.max(Number(body.delaySec) || 2, 0), 30),
    dismissHours: Math.min(Math.max(Number(body.dismissHours) || 24, 1), 168),
    showOnRoutesJson: JSON.stringify(showOnRoutes),
  };
}

async function getClientStatus() {
  await ensureDefaults();
  const settings = await promoPopupRepository.getSettings();
  const promo = await resolveFeaturedPromo(settings);

  if (!settings?.isEnabled) {
    return {
      willShow: false,
      level: 'warning',
      message: 'Popup đang tắt — bật "Hiển thị trên website" và lưu.',
    };
  }

  if (!promo) {
    if (settings.selectionMode === 'manual') {
      return {
        willShow: false,
        level: 'danger',
        message: 'Đã bật popup nhưng chưa chọn mã hợp lệ (hoặc mã hết hạn / hết lượt).',
      };
    }
    return {
      willShow: false,
      level: 'danger',
      message: 'Đã bật popup nhưng không có mã nào khớp bộ lọc loại giảm đang hiệu lực.',
    };
  }

  return {
    willShow: true,
    level: 'success',
    message: `Khách sẽ thấy popup mã ${promo.code} (${formatDiscountLabel(promo)}) trên các trang đã chọn.`,
    promoCode: promo.code,
  };
}

async function updateSettings(body) {
  const data = parseFormBody(body);
  await ensureDefaults();

  if (data.isEnabled) {
    if (data.selectionMode === 'manual' && !data.promoCodeId) {
      throw new Error('Bật popup ở chế độ "Chọn mã cụ thể" — hãy chọn một mã giảm giá.');
    }
    if (data.selectionMode === 'by_type') {
      const eligible = await listEligiblePromos(data.discountTypeFilter);
      if (!eligible.length) {
        throw new Error('Không có mã giảm giá hợp lệ khớp bộ lọc loại giảm đã chọn.');
      }
    } else {
      const promo = await promoCodeRepository.findById(data.promoCodeId);
      if (!isPromoEligible(promo)) {
        throw new Error('Mã giảm giá đã chọn không còn hiệu lực hoặc đã hết lượt dùng.');
      }
    }
  }

  return promoPopupRepository.upsertSettings(data);
}

module.exports = {
  buildDefaultSettings,
  ensureDefaults,
  getPublicConfig,
  getAdminSettings,
  getClientStatus,
  updateSettings,
  listEligiblePromos,
  formatDiscountLabel,
};
