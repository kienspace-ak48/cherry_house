const homePageRepository = require('../repositories/homePage.repository');
const { getPublicSiteUrl } = require('../config/appUrl.config');

const DEFAULT_AREA_IMAGES = [
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=800&q=80',
];

const DEFAULT_KIND_IMAGES = [
  'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c45751?auto=format&fit=crop&w=800&q=80',
];

function buildDefaultAreas() {
  return [
    {
      title: 'Đà Lạt',
      subtitle: '38 cơ sở · Homestay & Villa',
      imageUrl: DEFAULT_AREA_IMAGES[0],
      priceFrom: 'từ 450K/đêm',
      filterCity: 'Đà Lạt',
      isFeatured: true,
      comingSoon: false,
    },
    {
      title: 'Vũng Tàu',
      subtitle: '24 cơ sở',
      imageUrl: DEFAULT_AREA_IMAGES[1],
      priceFrom: 'từ 380K',
      filterCity: 'Vũng Tàu',
      isFeatured: false,
      comingSoon: false,
    },
    {
      title: 'Đà Nẵng',
      subtitle: '31 cơ sở',
      imageUrl: DEFAULT_AREA_IMAGES[2],
      priceFrom: 'từ 520K',
      filterCity: 'Đà Nẵng',
      isFeatured: false,
      comingSoon: false,
    },
    {
      title: 'Phú Quốc',
      subtitle: '19 cơ sở',
      imageUrl: DEFAULT_AREA_IMAGES[3],
      priceFrom: 'từ 680K',
      filterCity: 'Phú Quốc',
      isFeatured: false,
      comingSoon: false,
    },
  ];
}

function buildDefaultReviews() {
  return [
    {
      quote:
        'Đặt phòng nhanh, giá y chang trên web, không bị hỏi thêm phí gì. Host phản hồi trong 10 phút — sẽ quay lại Cherry House.',
      name: 'Lan Nguyễn',
      meta: 'TP. Hồ Chí Minh · Đặt Homestay Đà Lạt',
      initials: 'LN',
      rating: 5,
    },
    {
      quote:
        'Villa rộng hơn ảnh rất nhiều. Lần đầu đặt qua Cherry House mà thấy tin tưởng hơn hẳn so với app trung gian.',
      name: 'Minh Tú',
      meta: 'Hà Nội · Đặt Villa Vũng Tàu',
      initials: 'MT',
      rating: 5,
    },
    {
      quote:
        'Giá tốt hơn 15% so với Booking.com cho cùng phòng. Cherry House là lựa chọn đầu tiên khi đi công tác.',
      name: 'Hoàng Kim',
      meta: 'Đà Nẵng · Đặt Mini Hotel Đà Nẵng',
      initials: 'HK',
      rating: 5,
    },
  ];
}

function buildDefaultKinds() {
  return [
    {
      kind: 'homestay',
      badge: 'PHỔ BIẾN NHẤT',
      countLabel: '64 cơ sở',
      imageUrl: DEFAULT_KIND_IMAGES[0],
    },
    {
      kind: 'mini_hotel',
      badge: '',
      countLabel: '38 cơ sở',
      imageUrl: DEFAULT_KIND_IMAGES[1],
    },
    {
      kind: 'villa',
      badge: 'CAO CẤP',
      countLabel: '22 cơ sở',
      imageUrl: DEFAULT_KIND_IMAGES[2],
    },
    {
      kind: 'serviced_apartment',
      badge: '',
      countLabel: '15 cơ sở',
      imageUrl: DEFAULT_KIND_IMAGES[3],
    },
  ];
}

function buildDefaultSettings() {
  return {
    statsEnabled: true,
    statsJson: JSON.stringify([
      { value: '2,400+', label: 'Lượt đặt phòng thành công' },
      { value: '120+', label: 'Cơ sở đối tác' },
      { value: '4.8★', label: 'Đánh giá trung bình' },
      { value: '12', label: 'Điểm đến trên cả nước' },
    ]),
    whyEnabled: true,
    whyEyebrow: 'TẠI SAO CHERRY HOUSE?',
    whyTitle: 'Đặt trực tiếp — luôn tốt hơn',
    whyDescription:
      'Không qua trung gian, giá hiển thị là giá thanh toán, hỗ trợ thực sự từ chủ cơ sở.',
    whyItemsJson: JSON.stringify([
      {
        number: '01',
        title: 'Giá minh bạch',
        description:
          'Xem giá phòng đầy đủ trước khi đặt — không có khoản phí nào được cộng vào lúc thanh toán.',
      },
      {
        number: '02',
        title: 'Nhiều chi nhánh',
        description:
          'Một cơ sở thường có nhiều điểm ở cùng khu vực — dễ chọn nơi gần bạn nhất.',
      },
      {
        number: '03',
        title: 'Đặt nhanh, tức thì',
        description:
          'Chọn ngày và phòng trong vài bước — xác nhận ngay, không cần chờ duyệt thủ công.',
      },
    ]),
    areasEnabled: true,
    areasEyebrow: 'KHÁM PHÁ',
    areasTitle: 'Khu vực phổ biến',
    areasSeeAllLabel: 'Xem tất cả',
    areasSeeAllHref: '/booking',
    areasJson: JSON.stringify(buildDefaultAreas()),
    kindsEnabled: true,
    kindsEyebrow: 'LOẠI HÌNH',
    kindsTitle: 'Chọn kiểu lưu trú phù hợp',
    kindsDescription: 'Từ homestay ấm cúng đến villa riêng tư — đặt theo đúng nhu cầu.',
    kindsJson: JSON.stringify(buildDefaultKinds()),
    reviewsEnabled: true,
    reviewsEyebrow: 'ĐÁNH GIÁ TỪ KHÁCH THỰC',
    reviewsTitle: 'Họ đã nói gì về Cherry House?',
    reviewsJson: JSON.stringify(buildDefaultReviews()),
    newsletterEnabled: true,
    newsletterTitle: 'Nhận deal sớm nhất',
    newsletterDescription:
      'Giá ưu đãi và phòng trống mới nhất gửi thẳng vào hộp thư — mỗi tuần một lần, không spam.',
    newsletterPlaceholder: 'Email của bạn',
    newsletterButtonLabel: 'Đăng ký ngay',
    newsletterSuccessMessage: 'Cảm ơn bạn! Cherry House sẽ gửi ưu đãi vào email của bạn.',
  };
}

function parseJsonArray(raw, fallback = []) {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === '') return [];
  return [value];
}

function resolvePublicAssetUrl(path, siteUrl) {
  const raw = String(path || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  const base = String(siteUrl || '').replace(/\/$/, '');
  if (!base) return raw.startsWith('/') ? raw : `/${raw}`;
  return `${base}${raw.startsWith('/') ? raw : `/${raw}`}`;
}

function parseStatsFromBody(body) {
  const values = asArray(body['statValue[]'] ?? body.statValue);
  const labels = asArray(body['statLabel[]'] ?? body.statLabel);
  const count = Math.max(values.length, labels.length);
  const stats = [];

  for (let i = 0; i < count; i += 1) {
    const value = String(values[i] || '').trim();
    const label = String(labels[i] || '').trim();
    if (!value && !label) continue;
    if (!value || !label) throw new Error(`Thống kê ${i + 1} cần đủ số liệu và nhãn`);
    stats.push({ value: value.slice(0, 40), label: label.slice(0, 120) });
  }
  if (!stats.length) throw new Error('Cần ít nhất một chỉ số thống kê');
  return stats;
}

function readSectionScalar(body, leadKey, legacyKey) {
  const lead = body[leadKey];
  if (lead !== undefined && lead !== null && String(lead).trim()) {
    return String(lead).trim();
  }
  const legacy = body[legacyKey];
  if (typeof legacy === 'string') return legacy.trim();
  if (Array.isArray(legacy) && legacy.length) return String(legacy[0] || '').trim();
  return '';
}

function parseWhyItemsFromBody(body) {
  const numbers = asArray(body['whyNumber[]'] ?? body.whyNumber);
  // Không dùng body.whyTitle / body.whyDescription — Express qs gộp với field section thành mảng 4 phần tử.
  const titles = asArray(body['whyItemTitle[]'] ?? body.whyItemTitle ?? body['whyTitle[]']);
  const descriptions = asArray(
    body['whyItemDescription[]'] ?? body.whyItemDescription ?? body['whyDescription[]'],
  );
  const count = Math.max(numbers.length, titles.length, descriptions.length);
  const items = [];

  for (let i = 0; i < count; i += 1) {
    const number = String(numbers[i] || '').trim();
    const title = String(titles[i] || '').trim();
    const description = String(descriptions[i] || '').trim();
    if (!number && !title && !description) continue;
    if (!number || !title || !description) {
      throw new Error(`Ưu điểm ${i + 1} cần đủ số thứ tự, tiêu đề và mô tả`);
    }
    items.push({ number: number.slice(0, 8), title: title.slice(0, 120), description });
  }
  if (!items.length) throw new Error('Cần ít nhất một ưu điểm');
  return items;
}

function parseAreasFromBody(body) {
  const titles = asArray(body['areaTitle[]'] ?? body.areaTitle);
  const subtitles = asArray(body['areaSubtitle[]'] ?? body.areaSubtitle);
  const imageUrls = asArray(body['areaImageUrl[]'] ?? body.areaImageUrl);
  const priceFroms = asArray(body['areaPriceFrom[]'] ?? body.areaPriceFrom);
  const filterCities = asArray(body['areaFilterCity[]'] ?? body.areaFilterCity);
  const comingSoonFlags = asArray(body['areaComingSoon[]'] ?? body.areaComingSoon);
  const featuredIndex = Number.parseInt(String(body.areaFeaturedIndex ?? '0'), 10);
  const count = Math.max(titles.length, imageUrls.length, comingSoonFlags.length);
  const areas = [];

  for (let i = 0; i < count; i += 1) {
    const title = String(titles[i] || '').trim();
    const imageUrl = String(imageUrls[i] || '').trim();
    if (!title && !imageUrl) continue;
    if (!title || !imageUrl) throw new Error(`Khu vực ${i + 1} cần tiêu đề và ảnh`);
    const comingSoonRaw = comingSoonFlags[i];
    areas.push({
      title: title.slice(0, 120),
      subtitle: String(subtitles[i] || '').trim().slice(0, 160),
      imageUrl,
      priceFrom: String(priceFroms[i] || '').trim().slice(0, 40),
      filterCity: String(filterCities[i] || title).trim().slice(0, 80),
      isFeatured: i === featuredIndex,
      comingSoon: comingSoonRaw === '1' || comingSoonRaw === 'on' || comingSoonRaw === true,
    });
  }
  if (!areas.length) throw new Error('Cần ít nhất một khu vực');
  if (!areas.some((a) => a.isFeatured)) areas[0].isFeatured = true;
  return areas;
}

function parseKindsFromBody(body) {
  const kinds = asArray(body['kindType[]'] ?? body.kindType);
  const badges = asArray(body['kindBadge[]'] ?? body.kindBadge);
  const countLabels = asArray(body['kindCountLabel[]'] ?? body.kindCountLabel);
  const imageUrls = asArray(body['kindImageUrl[]'] ?? body.kindImageUrl);
  const count = Math.max(kinds.length, imageUrls.length);
  const items = [];
  const allowed = new Set(['homestay', 'mini_hotel', 'villa', 'serviced_apartment']);

  for (let i = 0; i < count; i += 1) {
    const kind = String(kinds[i] || '').trim();
    const imageUrl = String(imageUrls[i] || '').trim();
    if (!kind && !imageUrl) continue;
    if (!kind || !allowed.has(kind)) throw new Error(`Loại hình ${i + 1} không hợp lệ`);
    if (!imageUrl) throw new Error(`Loại hình ${i + 1} cần ảnh`);
    items.push({
      kind,
      badge: String(badges[i] || '').trim().slice(0, 40),
      countLabel: String(countLabels[i] || '').trim().slice(0, 80),
      imageUrl,
    });
  }
  if (!items.length) throw new Error('Cần ít nhất một loại hình');
  return items;
}

function deriveInitials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase();
}

function parseReviewsFromBody(body) {
  const quotes = asArray(body['reviewQuote[]'] ?? body.reviewQuote);
  const names = asArray(body['reviewName[]'] ?? body.reviewName);
  const metas = asArray(body['reviewMeta[]'] ?? body.reviewMeta);
  const initialsList = asArray(body['reviewInitials[]'] ?? body.reviewInitials);
  const ratings = asArray(body['reviewRating[]'] ?? body.reviewRating);
  const count = Math.max(quotes.length, names.length, metas.length);
  const items = [];

  for (let i = 0; i < count; i += 1) {
    const quote = String(quotes[i] || '').trim();
    const name = String(names[i] || '').trim();
    const meta = String(metas[i] || '').trim();
    if (!quote && !name && !meta) continue;
    if (!quote || !name) throw new Error(`Đánh giá ${i + 1} cần nội dung và tên khách`);
    const ratingRaw = Number.parseInt(String(ratings[i] ?? '5'), 10);
    const rating = Number.isFinite(ratingRaw) ? Math.min(5, Math.max(1, ratingRaw)) : 5;
    const initials = String(initialsList[i] || '').trim().slice(0, 4) || deriveInitials(name);
    items.push({
      quote,
      name: name.slice(0, 120),
      meta: meta.slice(0, 160),
      initials,
      rating,
    });
  }
  if (!items.length) throw new Error('Cần ít nhất một đánh giá khách');
  return items;
}

function normalizeReviews(items) {
  return items.map((item) => ({
    quote: item.quote || '',
    name: item.name || '',
    meta: item.meta || '',
    initials: item.initials || deriveInitials(item.name),
    rating: Math.min(5, Math.max(1, Number(item.rating) || 5)),
  }));
}

function normalizeAreas(areas, siteUrl) {
  return areas.map((area) => ({
    title: area.title || '',
    subtitle: area.subtitle || '',
    imageUrl: resolvePublicAssetUrl(area.imageUrl, siteUrl),
    priceFrom: area.priceFrom || '',
    filterCity: area.filterCity || area.title || '',
    isFeatured: Boolean(area.isFeatured),
    comingSoon: Boolean(area.comingSoon),
  }));
}

function normalizeKinds(items, siteUrl) {
  return items.map((item) => ({
    kind: item.kind,
    badge: item.badge || '',
    countLabel: item.countLabel || '',
    imageUrl: resolvePublicAssetUrl(item.imageUrl, siteUrl),
  }));
}

function pickArray(raw, fallback) {
  const parsed = parseJsonArray(raw, fallback);
  return parsed.length ? parsed : fallback;
}

function rowToPublic(row, siteUrl = '') {
  const defaults = buildDefaultSettings();
  const defaultStats = parseJsonArray(defaults.statsJson);
  const defaultWhyItems = parseJsonArray(defaults.whyItemsJson);
  const defaultAreas = buildDefaultAreas();
  const defaultKinds = buildDefaultKinds();
  const defaultReviews = buildDefaultReviews();

  return {
    statsEnabled: row?.statsEnabled ?? true,
    stats: pickArray(row?.statsJson, defaultStats),
    whyEnabled: row?.whyEnabled ?? true,
    whyEyebrow: row?.whyEyebrow || defaults.whyEyebrow,
    whyTitle: row?.whyTitle || defaults.whyTitle,
    whyDescription: row?.whyDescription || defaults.whyDescription,
    whyItems: pickArray(row?.whyItemsJson, defaultWhyItems),
    areasEnabled: row?.areasEnabled ?? true,
    areasEyebrow: row?.areasEyebrow || defaults.areasEyebrow,
    areasTitle: row?.areasTitle || defaults.areasTitle,
    areasSeeAllLabel: row?.areasSeeAllLabel || defaults.areasSeeAllLabel,
    areasSeeAllHref: row?.areasSeeAllHref || defaults.areasSeeAllHref,
    areas: normalizeAreas(pickArray(row?.areasJson, defaultAreas), siteUrl),
    kindsEnabled: row?.kindsEnabled ?? true,
    kindsEyebrow: row?.kindsEyebrow || defaults.kindsEyebrow,
    kindsTitle: row?.kindsTitle || defaults.kindsTitle,
    kindsDescription: row?.kindsDescription || defaults.kindsDescription,
    kinds: normalizeKinds(pickArray(row?.kindsJson, defaultKinds), siteUrl),
    reviewsEnabled: row?.reviewsEnabled ?? true,
    reviewsEyebrow: row?.reviewsEyebrow || defaults.reviewsEyebrow,
    reviewsTitle: row?.reviewsTitle || defaults.reviewsTitle,
    reviews: normalizeReviews(pickArray(row?.reviewsJson, defaultReviews)),
    newsletterEnabled: row?.newsletterEnabled ?? true,
    newsletterTitle: row?.newsletterTitle || defaults.newsletterTitle,
    newsletterDescription: row?.newsletterDescription || defaults.newsletterDescription,
    newsletterPlaceholder: row?.newsletterPlaceholder || defaults.newsletterPlaceholder,
    newsletterButtonLabel: row?.newsletterButtonLabel || defaults.newsletterButtonLabel,
    newsletterSuccessMessage: row?.newsletterSuccessMessage || defaults.newsletterSuccessMessage,
  };
}

async function ensureDefaults() {
  const existing = await homePageRepository.getSettings();
  if (existing) return;

  try {
    await homePageRepository.upsertSettings(buildDefaultSettings());
  } catch (err) {
    if (err?.code === 'HOME_PAGE_PRISMA_NOT_GENERATED' || err?.code === 'HOME_PAGE_TABLE_MISSING') {
      return;
    }
    throw err;
  }
}

async function getPublicConfig(req) {
  await ensureDefaults();
  const row = await homePageRepository.getSettings();
  const siteUrl = getPublicSiteUrl(req);
  return rowToPublic(row, siteUrl);
}

function padAdminLists(config) {
  const defaults = buildDefaultSettings();
  const defaultStats = parseJsonArray(defaults.statsJson);
  const defaultWhyItems = parseJsonArray(defaults.whyItemsJson);
  const defaultAreas = buildDefaultAreas();
  const defaultKinds = buildDefaultKinds();
  const defaultReviews = buildDefaultReviews();

  const stats = [...(config.stats || [])];
  while (stats.length < 4) stats.push(defaultStats[stats.length] || { value: '', label: '' });

  const whyItems = [...(config.whyItems || [])];
  while (whyItems.length < 3) {
    whyItems.push(defaultWhyItems[whyItems.length] || { number: '', title: '', description: '' });
  }

  const areas = ensureMinAdminRows(config.areas, {
    title: '',
    subtitle: '',
    imageUrl: '',
    priceFrom: '',
    filterCity: '',
    isFeatured: true,
    comingSoon: false,
  });

  const kinds = ensureMinAdminRows(config.kinds, {
    kind: 'homestay',
    badge: '',
    countLabel: '',
    imageUrl: '',
  });

  const reviews = ensureMinAdminRows(config.reviews, {
    quote: '',
    name: '',
    meta: '',
    initials: '',
    rating: 5,
  });

  return {
    ...config,
    stats: stats.slice(0, 4),
    whyItems: whyItems.slice(0, 3),
    areas,
    kinds,
    reviews,
  };
}

function ensureMinAdminRows(items, emptyRow) {
  const list = Array.isArray(items) ? items.filter((item) => item && typeof item === 'object') : [];
  return list.length ? list : [{ ...emptyRow }];
}

async function getAdminSettings() {
  await ensureDefaults();
  const row = await homePageRepository.getSettings();
  return padAdminLists(rowToPublic(row));
}

function parseFormBody(body) {
  const data = {
    statsEnabled: body.statsEnabled === '1' || body.statsEnabled === true || body.statsEnabled === 'on',
    statsJson: JSON.stringify(parseStatsFromBody(body)),
    whyEnabled: body.whyEnabled === '1' || body.whyEnabled === true || body.whyEnabled === 'on',
    whyEyebrow: String(body.whyEyebrow || '').trim().slice(0, 120),
    whyTitle: readSectionScalar(body, 'whyLeadTitle', 'whyTitle').slice(0, 255),
    whyDescription: readSectionScalar(body, 'whyLeadDescription', 'whyDescription'),
    whyItemsJson: JSON.stringify(parseWhyItemsFromBody(body)),
    areasEnabled: body.areasEnabled === '1' || body.areasEnabled === true || body.areasEnabled === 'on',
    areasEyebrow: String(body.areasEyebrow || '').trim().slice(0, 120),
    areasTitle: String(body.areasTitle || '').trim().slice(0, 255),
    areasSeeAllLabel: String(body.areasSeeAllLabel || '').trim().slice(0, 80),
    areasSeeAllHref: String(body.areasSeeAllHref || '').trim().slice(0, 500) || '/booking',
    areasJson: JSON.stringify(parseAreasFromBody(body)),
    kindsEnabled: body.kindsEnabled === '1' || body.kindsEnabled === true || body.kindsEnabled === 'on',
    kindsEyebrow: String(body.kindsEyebrow || '').trim().slice(0, 120),
    kindsTitle: String(body.kindsTitle || '').trim().slice(0, 255),
    kindsDescription: String(body.kindsDescription || '').trim(),
    kindsJson: JSON.stringify(parseKindsFromBody(body)),
    reviewsEnabled: body.reviewsEnabled === '1' || body.reviewsEnabled === true || body.reviewsEnabled === 'on',
    reviewsEyebrow: String(body.reviewsEyebrow || '').trim().slice(0, 120),
    reviewsTitle: String(body.reviewsTitle || '').trim().slice(0, 255),
    reviewsJson: JSON.stringify(parseReviewsFromBody(body)),
    newsletterEnabled:
      body.newsletterEnabled === '1' || body.newsletterEnabled === true || body.newsletterEnabled === 'on',
    newsletterTitle: String(body.newsletterTitle || '').trim().slice(0, 255),
    newsletterDescription: String(body.newsletterDescription || '').trim(),
    newsletterPlaceholder: String(body.newsletterPlaceholder || '').trim().slice(0, 120),
    newsletterButtonLabel: String(body.newsletterButtonLabel || '').trim().slice(0, 80),
    newsletterSuccessMessage: String(body.newsletterSuccessMessage || '').trim().slice(0, 255),
  };

  if (!data.whyEyebrow || !data.whyTitle || !data.whyDescription) {
    throw new Error('Phần "Tại sao" cần eyebrow, tiêu đề và mô tả');
  }
  if (!data.areasEyebrow || !data.areasTitle) {
    throw new Error('Phần "Khu vực" cần eyebrow và tiêu đề');
  }
  if (!data.kindsEyebrow || !data.kindsTitle || !data.kindsDescription) {
    throw new Error('Phần "Loại hình" cần eyebrow, tiêu đề và mô tả');
  }
  if (!data.reviewsEyebrow || !data.reviewsTitle) {
    throw new Error('Phần "Đánh giá" cần eyebrow và tiêu đề');
  }
  if (!data.newsletterTitle || !data.newsletterDescription) {
    throw new Error('Phần "Newsletter" cần tiêu đề và mô tả');
  }
  if (!data.newsletterPlaceholder || !data.newsletterButtonLabel) {
    throw new Error('Phần "Newsletter" cần placeholder và nhãn nút');
  }

  return data;
}

async function updateSettings(body) {
  const data = parseFormBody(body);
  await ensureDefaults();
  return homePageRepository.upsertSettings(data);
}

async function resetToDefaults() {
  await homePageRepository.upsertSettings(buildDefaultSettings());
}

module.exports = {
  buildDefaultSettings,
  buildDefaultAreas,
  buildDefaultKinds,
  buildDefaultReviews,
  ensureDefaults,
  getPublicConfig,
  getAdminSettings,
  updateSettings,
  resetToDefaults,
};
