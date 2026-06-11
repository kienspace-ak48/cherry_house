const homeHeroRepository = require('../repositories/homeHero.repository');
const { getPublicSiteUrl } = require('../config/appUrl.config');

const DEFAULT_HERO_IMG =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80';

function buildDefaultSettings() {
  return {
    badgeText: 'Website chính thức Cherry House',
    titleLine1: 'Trải nghiệm lưu trú',
    titleLine2: 'ấm áp trên khắp Việt Nam',
    description:
      'Homestay, mini stay và villa đồng bộ thương hiệu — tìm theo địa điểm, chọn chi nhánh phù hợp và đặt phòng trực tiếp.',
    quickCitiesJson: JSON.stringify(['Đà Lạt', 'Đà Nẵng', 'Vũng Tàu', 'Hội An', 'Phú Quốc']),
    slidesJson: JSON.stringify([
      {
        imageUrl: DEFAULT_HERO_IMG,
        alt: 'Cherry House — homestay và mini stay trên khắp Việt Nam',
        badge: 'Website chính thức Cherry House',
        titleLine1: 'Trải nghiệm lưu trú',
        titleLine2: 'ấm áp trên khắp Việt Nam',
        description:
          'Homestay, mini stay và villa đồng bộ thương hiệu — tìm theo địa điểm, chọn chi nhánh phù hợp và đặt phòng trực tiếp.',
      },
    ]),
    slideIntervalSec: 6,
    isEnabled: true,
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

function parseQuickCities(raw) {
  if (Array.isArray(raw)) {
    return raw.map((c) => String(c).trim()).filter(Boolean);
  }
  const text = String(raw || '').trim();
  if (!text) return [];
  return text
    .split(/[,;|\n]+/)
    .map((c) => c.trim())
    .filter(Boolean);
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === '') return [];
  return [value];
}

function parseSlidesFromBody(body) {
  const imageUrls = asArray(body['slideImageUrl[]'] ?? body.slideImageUrl);
  const alts = asArray(body['slideAlt[]'] ?? body.slideAlt);
  const badges = asArray(body['slideBadge[]'] ?? body.slideBadge);
  const titleLine1s = asArray(body['slideTitleLine1[]'] ?? body.slideTitleLine1);
  const titleLine2s = asArray(body['slideTitleLine2[]'] ?? body.slideTitleLine2);
  const descriptions = asArray(body['slideDescription[]'] ?? body.slideDescription);

  const rowCount = Math.max(
    imageUrls.length,
    badges.length,
    titleLine1s.length,
    titleLine2s.length,
    descriptions.length,
    alts.length,
  );

  const slides = [];
  for (let i = 0; i < rowCount; i += 1) {
    const imageUrl = String(imageUrls[i] || '').trim();
    const titleLine1 = String(titleLine1s[i] || '').trim();
    const description = String(descriptions[i] || '').trim();
    const hasContent = imageUrl || titleLine1 || description;

    if (!hasContent) continue;

    if (!imageUrl) {
      throw new Error(`Slide ${i + 1} thiếu ảnh banner — hãy chọn ảnh từ Gallery`);
    }

    slides.push({
      imageUrl,
      alt: String(alts[i] || '').trim() || 'Cherry House — homestay và villa',
      badge: String(badges[i] || '').trim().slice(0, 255),
      titleLine1: titleLine1.slice(0, 255),
      titleLine2: String(titleLine2s[i] || '').trim().slice(0, 255),
      description,
    });
  }
  return slides;
}

function resolvePublicAssetUrl(path, siteUrl) {
  const raw = String(path || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  const base = String(siteUrl || '').replace(/\/$/, '');
  if (!base) return raw.startsWith('/') ? raw : `/${raw}`;
  return `${base}${raw.startsWith('/') ? raw : `/${raw}`}`;
}

function normalizeSlide(slide, globalDefaults, siteUrl) {
  const defaults = buildDefaultSettings();
  const fallbackSlides = parseJsonArray(defaults.slidesJson);
  const fallbackSlide = fallbackSlides[0] || {};
  const rawImageUrl = slide.imageUrl || slide.image_url || '';

  return {
    imageUrl: resolvePublicAssetUrl(rawImageUrl, siteUrl),
    alt: slide.alt || fallbackSlide.alt || 'Cherry House — homestay và villa',
    badge: slide.badge || globalDefaults.badgeText || fallbackSlide.badge || '',
    titleLine1: slide.titleLine1 || globalDefaults.titleLine1 || fallbackSlide.titleLine1 || '',
    titleLine2: slide.titleLine2 || globalDefaults.titleLine2 || fallbackSlide.titleLine2 || '',
    description: slide.description || globalDefaults.description || fallbackSlide.description || '',
  };
}

function rowToPublic(row, siteUrl = '') {
  const defaults = buildDefaultSettings();
  const quickCities = parseJsonArray(row?.quickCitiesJson, parseJsonArray(defaults.quickCitiesJson));
  const rawSlides = parseJsonArray(row?.slidesJson, parseJsonArray(defaults.slidesJson));
  const globalDefaults = {
    badgeText: row?.badgeText || defaults.badgeText,
    titleLine1: row?.titleLine1 || defaults.titleLine1,
    titleLine2: row?.titleLine2 || defaults.titleLine2,
    description: row?.description || defaults.description,
  };
  const slides = (rawSlides.length ? rawSlides : parseJsonArray(defaults.slidesJson)).map((slide) =>
    normalizeSlide(slide, globalDefaults, siteUrl),
  );

  return {
    quickCities,
    slides,
    slideIntervalSec: row?.slideIntervalSec ?? defaults.slideIntervalSec,
    isEnabled: row?.isEnabled ?? true,
  };
}

async function ensureDefaults() {
  const existing = await homeHeroRepository.getSettings();
  if (existing) return;

  try {
    await homeHeroRepository.upsertSettings(buildDefaultSettings());
  } catch (err) {
    if (err?.code === 'HOME_HERO_PRISMA_NOT_GENERATED' || err?.code === 'HOME_HERO_TABLE_MISSING') {
      return;
    }
    throw err;
  }
}

async function getPublicConfig(req) {
  await ensureDefaults();
  const row = await homeHeroRepository.getSettings();
  const siteUrl = getPublicSiteUrl(req);
  return rowToPublic(row, siteUrl);
}

async function getAdminSettings() {
  await ensureDefaults();
  const row = await homeHeroRepository.getSettings();
  const publicConfig = rowToPublic(row);
  return {
    ...publicConfig,
    quickCitiesText: publicConfig.quickCities.join(', '),
  };
}

function parseFormBody(body) {
  const slides = parseSlidesFromBody(body);
  if (!slides.length) {
    throw new Error('Cần ít nhất một ảnh banner');
  }

  const interval = Number.parseInt(String(body.slideIntervalSec || '6'), 10);
  const slideIntervalSec = Number.isFinite(interval) ? Math.min(30, Math.max(3, interval)) : 6;

  const firstSlide = slides[0] || {};

  return {
    badgeText: firstSlide.badge || '',
    titleLine1: firstSlide.titleLine1 || '',
    titleLine2: firstSlide.titleLine2 || '',
    description: firstSlide.description || '',
    quickCitiesJson: JSON.stringify(parseQuickCities(body.quickCities)),
    slidesJson: JSON.stringify(slides),
    slideIntervalSec,
    isEnabled: body.isEnabled === '1' || body.isEnabled === true || body.isEnabled === 'on',
  };
}

async function updateSettings(body) {
  const data = parseFormBody(body);
  const invalidSlide = JSON.parse(data.slidesJson).find(
    (slide) => !slide.titleLine1 || !slide.description,
  );
  if (invalidSlide) {
    throw new Error('Mỗi slide cần có tiêu đề (dòng 1) và mô tả');
  }
  await ensureDefaults();
  return homeHeroRepository.upsertSettings(data);
}

async function resetToDefaults() {
  await homeHeroRepository.upsertSettings(buildDefaultSettings());
}

module.exports = {
  buildDefaultSettings,
  ensureDefaults,
  getPublicConfig,
  getAdminSettings,
  updateSettings,
  resetToDefaults,
};
