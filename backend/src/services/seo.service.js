const { getClientAppUrl, getPublicSiteUrl } = require('../config/appUrl.config');
const prisma = require('../config/prisma.config');
const seoRepository = require('../repositories/seo.repository');

const DEFAULT_PAGE_TEMPLATES = [
  {
    pageKey: 'home',
    label: 'Trang chủ',
    titleTemplate: '{{siteName}} — Đặt homestay & mini stay Việt Nam',
    descriptionTemplate:
      'Homestay, mini stay và villa đồng bộ thương hiệu Cherry House. Tìm theo địa điểm, chọn chi nhánh và đặt phòng trực tuyến với giá minh bạch.',
    keywordsTemplate:
      'cherry house, homestay việt nam, đặt phòng online, mini stay, villa cho thuê',
    robots: 'index, follow',
    sortOrder: 10,
  },
  {
    pageKey: 'about',
    label: 'Giới thiệu',
    titleTemplate: 'Giới thiệu {{siteName}} — Homestay & lưu trú ấm áp',
    descriptionTemplate:
      'Tìm hiểu Cherry House — mô hình homestay, mini hotel và villa trên khắp Việt Nam với trải nghiệm thân thiện và giá minh bạch.',
    keywordsTemplate: 'giới thiệu cherry house, homestay, mini hotel',
    robots: 'index, follow',
    sortOrder: 20,
  },
  {
    pageKey: 'contact',
    label: 'Liên hệ',
    titleTemplate: 'Liên hệ {{siteName}} — Hỗ trợ đặt phòng',
    descriptionTemplate:
      'Liên hệ Cherry House qua hotline, email hoặc form. Đội ngũ hỗ trợ đặt phòng và tư vấn lưu trú nhanh chóng.',
    keywordsTemplate: 'liên hệ cherry house, hotline đặt phòng',
    robots: 'index, follow',
    sortOrder: 30,
  },
  {
    pageKey: 'properties',
    label: 'Danh sách cơ sở',
    titleTemplate: 'Cơ sở lưu trú {{siteName}} — Homestay & mini stay',
    descriptionTemplate:
      'Khám phá các cơ sở Cherry House trên khắp Việt Nam. So sánh chi nhánh, giá từ và đặt phòng trực tuyến.',
    keywordsTemplate: 'cơ sở lưu trú, homestay việt nam, cherry house',
    robots: 'index, follow',
    sortOrder: 40,
  },
  {
    pageKey: 'property',
    label: 'Chi tiết cơ sở',
    titleTemplate: '{{propertyName}} tại {{city}} — {{siteName}}',
    descriptionTemplate:
      '{{tagline}} Đặt phòng {{propertyName}} tại {{city}}, {{region}}. Giá từ {{priceFrom}} — đặt online nhanh chóng.',
    keywordsTemplate: '{{propertyName}}, homestay {{city}}, đặt phòng {{city}}',
    robots: 'index, follow',
    sortOrder: 50,
  },
  {
    pageKey: 'branch_select',
    label: 'Chọn chi nhánh',
    titleTemplate: 'Chọn chi nhánh {{propertyName}} — {{siteName}}',
    descriptionTemplate:
      'Chọn chi nhánh phù hợp tại {{propertyName}}, {{city}}. Xem vị trí, giá và số phòng trống.',
    keywordsTemplate: 'chi nhánh {{propertyName}}, {{city}}',
    robots: 'index, follow',
    sortOrder: 60,
  },
  {
    pageKey: 'branch',
    label: 'Chi tiết chi nhánh',
    titleTemplate: '{{branchName}} — {{propertyName}} | {{siteName}}',
    descriptionTemplate:
      'Đặt phòng tại {{branchName}}, chi nhánh {{propertyName}} tại {{city}}. Xem phòng trống và giá theo ngày.',
    keywordsTemplate: '{{branchName}}, {{propertyName}}, homestay {{city}}',
    robots: 'index, follow',
    sortOrder: 70,
  },
  {
    pageKey: 'booking',
    label: 'Chọn phòng',
    titleTemplate: 'Chọn phòng tại {{branchName}} — {{siteName}}',
    descriptionTemplate:
      'Xem danh sách phòng trống và chọn phòng phù hợp tại Cherry House. Đặt nhanh, thanh toán VNPay.',
    keywordsTemplate: 'đặt phòng cherry house, chọn phòng',
    robots: 'index, follow',
    sortOrder: 80,
  },
  {
    pageKey: 'room',
    label: 'Chi tiết phòng',
    titleTemplate: 'Phòng {{roomName}} — {{branchName}} | {{siteName}}',
    descriptionTemplate:
      '{{roomDescription}} Đặt phòng {{roomCode}} tại {{branchName}}, {{propertyName}} — giá {{price}} / đêm.',
    keywordsTemplate: '{{roomCode}}, {{roomName}}, đặt phòng {{city}}',
    robots: 'index, follow',
    sortOrder: 90,
  },
  {
    pageKey: 'login',
    label: 'Đăng nhập',
    titleTemplate: 'Đăng nhập — {{siteName}}',
    descriptionTemplate: 'Đăng nhập tài khoản Cherry House để quản lý đặt phòng và thông tin cá nhân.',
    keywordsTemplate: 'đăng nhập cherry house',
    robots: 'noindex, nofollow',
    sortOrder: 100,
  },
  {
    pageKey: 'register',
    label: 'Đăng ký',
    titleTemplate: 'Đăng ký tài khoản — {{siteName}}',
    descriptionTemplate: 'Tạo tài khoản Cherry House để đặt phòng nhanh hơn và theo dõi lịch sử đặt chỗ.',
    keywordsTemplate: 'đăng ký cherry house',
    robots: 'noindex, nofollow',
    sortOrder: 110,
  },
  {
    pageKey: 'profile',
    label: 'Tài khoản',
    titleTemplate: 'Tài khoản của tôi — {{siteName}}',
    descriptionTemplate: 'Quản lý thông tin cá nhân và lịch sử đặt phòng Cherry House.',
    keywordsTemplate: null,
    robots: 'noindex, nofollow',
    sortOrder: 120,
  },
  {
    pageKey: 'checkout',
    label: 'Thanh toán',
    titleTemplate: 'Thanh toán đặt phòng — {{siteName}}',
    descriptionTemplate: 'Hoàn tất thanh toán đặt phòng Cherry House qua VNPay an toàn.',
    keywordsTemplate: null,
    robots: 'noindex, nofollow',
    sortOrder: 130,
  },
  {
    pageKey: 'checkout_result',
    label: 'Kết quả thanh toán',
    titleTemplate: 'Kết quả thanh toán — {{siteName}}',
    descriptionTemplate: 'Xem trạng thái thanh toán đặt phòng Cherry House.',
    keywordsTemplate: null,
    robots: 'noindex, nofollow',
    sortOrder: 140,
  },
];

function trimStr(value, max) {
  const s = typeof value === 'string' ? value.trim() : '';
  if (!max) return s;
  return s.length > max ? s.slice(0, max) : s;
}

function defaultSiteUrl(req) {
  return getPublicSiteUrl(req);
}

function isLegacyDevSiteUrl(url) {
  return /localhost:5173/i.test(String(url || ''));
}

function resolvePublicAssetUrl(path, siteUrl) {
  const raw = String(path || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  const base = String(siteUrl || '').replace(/\/$/, '');
  if (!base) return raw;
  return `${base}${raw.startsWith('/') ? raw : `/${raw}`}`;
}

function buildDefaultGlobal(req) {
  const siteUrl = defaultSiteUrl(req);
  return {
    siteName: 'Cherry House',
    siteUrl,
    defaultTitle: 'Cherry House — Đặt homestay & mini stay Việt Nam',
    defaultDescription:
      'Homestay, mini stay và villa đồng bộ thương hiệu Cherry House. Tìm theo địa điểm, chọn chi nhánh và đặt phòng trực tuyến.',
    defaultKeywords:
      'cherry house, homestay việt nam, đặt phòng online, mini stay, villa',
    ogImageUrl: '/favicon/android-chrome-512x512.png',
    twitterSite: null,
    themeColor: '#9f1239',
    organizationName: 'Cherry House',
    organizationDescription:
      'Hệ thống homestay, mini stay và villa trên khắp Việt Nam — đặt phòng trực tuyến, giá minh bạch.',
    organizationPhone: null,
    organizationEmail: 'contact@cherryhouse.vn',
    organizationAddress: 'Việt Nam',
    allowIndexing: true,
  };
}

async function ensureDefaults(req) {
  const existingGlobal = await seoRepository.getGlobalSettings();
  if (!existingGlobal) {
    await seoRepository.upsertGlobalSettings(buildDefaultGlobal(req));
  } else if (isLegacyDevSiteUrl(existingGlobal.siteUrl)) {
    await seoRepository.patchGlobalSettings({
      siteUrl: defaultSiteUrl(req),
    });
  }

  const existingPages = await seoRepository.listPageTemplates();
  if (!existingPages.length) {
    await seoRepository.createManyPageTemplates(DEFAULT_PAGE_TEMPLATES);
  }
}

function serializeGlobal(row) {
  if (!row) return null;
  const siteUrl = row.siteUrl.replace(/\/$/, '');
  return {
    siteName: row.siteName,
    siteUrl,
    defaultTitle: row.defaultTitle,
    defaultDescription: row.defaultDescription,
    defaultKeywords: row.defaultKeywords || '',
    ogImageUrl: resolvePublicAssetUrl(row.ogImageUrl, siteUrl),
    ogImagePath: row.ogImageUrl || '',
    twitterSite: row.twitterSite || '',
    themeColor: row.themeColor || '#9f1239',
    organization: {
      name: row.organizationName || row.siteName,
      description: row.organizationDescription || row.defaultDescription,
      phone: row.organizationPhone || '',
      email: row.organizationEmail || '',
      address: row.organizationAddress || '',
    },
    allowIndexing: row.allowIndexing,
    updatedAt: row.updatedAt,
  };
}

function serializePageTemplate(row, siteUrl = '') {
  return {
    pageKey: row.pageKey,
    label: row.label,
    titleTemplate: row.titleTemplate,
    descriptionTemplate: row.descriptionTemplate,
    keywordsTemplate: row.keywordsTemplate || '',
    robots: row.robots,
    ogImageUrl: resolvePublicAssetUrl(row.ogImageUrl, siteUrl),
    isActive: row.isActive,
    sortOrder: row.sortOrder,
  };
}

async function getPublicConfig(req) {
  await ensureDefaults(req);
  const [global, pages] = await Promise.all([
    seoRepository.getGlobalSettings(),
    seoRepository.listPageTemplates(),
  ]);

  const serializedGlobal = serializeGlobal(global);
  return {
    global: serializedGlobal,
    pages: pages
      .filter((p) => p.isActive)
      .map((p) => serializePageTemplate(p, serializedGlobal?.siteUrl || '')),
  };
}

function parseGlobalFormBody(body, req) {
  let siteUrl = trimStr(body.siteUrl, 500).replace(/\/$/, '');
  if (isLegacyDevSiteUrl(siteUrl)) {
    siteUrl = defaultSiteUrl(req);
  }

  return {
    siteName: trimStr(body.siteName, 120),
    siteUrl,
    defaultTitle: trimStr(body.defaultTitle, 255),
    defaultDescription: trimStr(body.defaultDescription),
    defaultKeywords: trimStr(body.defaultKeywords, 500) || null,
    ogImageUrl: trimStr(body.ogImageUrl, 500) || null,
    twitterSite: trimStr(body.twitterSite, 120) || null,
    themeColor: trimStr(body.themeColor, 20) || null,
    organizationName: trimStr(body.organizationName, 255) || null,
    organizationDescription: trimStr(body.organizationDescription) || null,
    organizationPhone: trimStr(body.organizationPhone, 30) || null,
    organizationEmail: trimStr(body.organizationEmail, 255) || null,
    organizationAddress: trimStr(body.organizationAddress, 500) || null,
    allowIndexing: body.allowIndexing === '1' || body.allowIndexing === true || body.allowIndexing === 'on',
  };
}

function parsePageFormBody(body) {
  return {
    label: trimStr(body.label, 120),
    titleTemplate: trimStr(body.titleTemplate, 255),
    descriptionTemplate: trimStr(body.descriptionTemplate),
    keywordsTemplate: trimStr(body.keywordsTemplate, 500) || null,
    robots: trimStr(body.robots, 40) || 'index, follow',
    ogImageUrl: trimStr(body.ogImageUrl, 500) || null,
    isActive: body.isActive === '1' || body.isActive === true || body.isActive === 'on',
  };
}

async function updateGlobalSettings(body, req) {
  const data = parseGlobalFormBody(body, req);
  if (!data.siteName || !data.siteUrl || !data.defaultTitle || !data.defaultDescription) {
    throw new Error('siteName, siteUrl, defaultTitle và defaultDescription là bắt buộc');
  }
  await ensureDefaults(req);
  return seoRepository.upsertGlobalSettings(data);
}

async function updatePageTemplate(pageKey, body) {
  const data = parsePageFormBody(body);
  if (!data.label || !data.titleTemplate || !data.descriptionTemplate) {
    throw new Error('label, titleTemplate và descriptionTemplate là bắt buộc');
  }
  await ensureDefaults();
  const existing = await seoRepository.getPageTemplateByKey(pageKey);
  if (!existing) {
    throw new Error('Không tìm thấy cấu hình trang');
  }
  return seoRepository.upsertPageTemplate(pageKey, data);
}

async function getAdminBundle(req) {
  await ensureDefaults(req);
  const [global, pages] = await Promise.all([
    seoRepository.getGlobalSettings(),
    seoRepository.listPageTemplates(),
  ]);
  return { global, pages };
}

function escapeXml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function buildRobotsTxt(req) {
  await ensureDefaults(req);
  const global = await seoRepository.getGlobalSettings();
  const base = (global?.siteUrl || defaultSiteUrl(req)).replace(/\/$/, '');

  const lines = ['User-agent: *'];
  if (global?.allowIndexing === false) {
    lines.push('Disallow: /');
  } else {
    lines.push('Allow: /');
    lines.push('Disallow: /admin');
    lines.push('Disallow: /api');
    lines.push('Disallow: /auth');
    lines.push('Disallow: /checkout');
    lines.push('Disallow: /profile');
    lines.push('Disallow: /login');
    lines.push('Disallow: /register');
    lines.push(`Sitemap: ${base}/sitemap.xml`);
  }
  return `${lines.join('\n')}\n`;
}

function formatPriceVnd(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return '';
  return `${Math.round(n).toLocaleString('vi-VN')} đ`;
}

async function buildSitemapXml(req) {
  await ensureDefaults(req);
  const global = await seoRepository.getGlobalSettings();
  const base = (global?.siteUrl || defaultSiteUrl(req)).replace(/\/$/, '');
  const now = new Date().toISOString();

  const staticPaths = [
    { loc: `${base}/`, priority: '1.0' },
    { loc: `${base}/about`, priority: '0.7' },
    { loc: `${base}/contact`, priority: '0.7' },
    { loc: `${base}/properties`, priority: '0.9' },
  ];

  const properties = await prisma.property.findMany({
    where: { isActive: true },
    select: {
      slug: true,
      updatedAt: true,
      branches: {
        where: { isActive: true },
        select: { id: true, updatedAt: true },
      },
    },
  });

  const roomTypes = await prisma.roomType.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  });

  const urls = [...staticPaths];

  for (const property of properties) {
    urls.push({
      loc: `${base}/properties/${property.slug}`,
      lastmod: property.updatedAt.toISOString(),
      priority: '0.8',
    });
    urls.push({
      loc: `${base}/properties/${property.slug}/branches`,
      lastmod: property.updatedAt.toISOString(),
      priority: '0.75',
    });
    for (const branch of property.branches) {
      urls.push({
        loc: `${base}/properties/${property.slug}/branches/${branch.id}`,
        lastmod: branch.updatedAt.toISOString(),
        priority: '0.7',
      });
    }
  }

  for (const roomType of roomTypes) {
    urls.push({
      loc: `${base}/room/${roomType.slug}`,
      lastmod: roomType.updatedAt.toISOString(),
      priority: '0.65',
    });
  }

  const body = urls
    .map((row) => {
      const parts = [
        '  <url>',
        `    <loc>${escapeXml(row.loc)}</loc>`,
        `    <lastmod>${escapeXml(row.lastmod || now)}</lastmod>`,
        '    <changefreq>weekly</changefreq>',
        `    <priority>${escapeXml(row.priority || '0.5')}</priority>`,
        '  </url>',
      ];
      return parts.join('\n');
    })
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    body,
    '</urlset>',
    '',
  ].join('\n');
}

module.exports = {
  ensureDefaults,
  getPublicConfig,
  getAdminBundle,
  updateGlobalSettings,
  updatePageTemplate,
  buildRobotsTxt,
  buildSitemapXml,
  buildDefaultGlobal,
  DEFAULT_PAGE_TEMPLATES,
};
