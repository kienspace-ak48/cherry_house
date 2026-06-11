const emailTemplateRepository = require('../repositories/emailTemplate.repository');
const {
  EMAIL_TEMPLATE_KEYS,
  TEMPLATE_META,
  defaultConfig,
  defaultSubject,
  buildDefaultTemplates,
} = require('../config/emailTemplate.defaults');
const {
  renderEmailHtml,
  renderSubject,
  buildPlainText,
} = require('../utils/emailLayout.util');
const { httpError } = require('../utils/http');

function parseConfigJson(raw) {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch (_err) {
    return {};
  }
}

function formatRow(row) {
  if (!row) return null;
  const meta = TEMPLATE_META.find((m) => m.key === row.templateKey);
  return {
    id: row.id,
    templateKey: row.templateKey,
    name: row.name,
    description: row.description,
    subject: row.subject,
    config: parseConfigJson(row.configJson),
    configJson: row.configJson,
    isEnabled: row.isEnabled,
    updatedAt: row.updatedAt,
    variables: meta?.variables || [],
  };
}

async function ensureSeeded() {
  const defaults = buildDefaultTemplates();
  for (const row of defaults) {
    const existing = await emailTemplateRepository.findByKey(row.templateKey);
    if (!existing) {
      await emailTemplateRepository.upsert(row);
    }
  }
}

async function listForAdmin() {
  await ensureSeeded();
  const rows = await emailTemplateRepository.findAll();
  return rows.map(formatRow);
}

async function getForAdmin(templateKey) {
  await ensureSeeded();
  const row = await emailTemplateRepository.findByKey(templateKey);
  if (!row) throw httpError('Template not found', 404);
  return formatRow(row);
}

async function getRenderable(templateKey) {
  await ensureSeeded();
  const row = await emailTemplateRepository.findByKey(templateKey);
  if (!row || !row.isEnabled) {
    const defaults = buildDefaultTemplates().find((t) => t.templateKey === templateKey);
    if (!defaults) throw httpError(`Unknown email template: ${templateKey}`, 500);
    return {
      templateKey,
      subject: defaults.subject,
      config: parseConfigJson(defaults.configJson),
      isEnabled: true,
    };
  }
  return {
    templateKey: row.templateKey,
    subject: row.subject,
    config: parseConfigJson(row.configJson),
    isEnabled: row.isEnabled,
  };
}

/**
 * Render email từ cấu hình admin + biến runtime.
 * @returns {{ subject: string, html: string, text: string }}
 */
async function render(templateKey, runtimeVars = {}, options = {}) {
  const tpl = await getRenderable(templateKey);
  const config = options.configOverrides
    ? { ...tpl.config, ...options.configOverrides }
    : tpl.config;
  const subjectTemplate = options.subjectOverride || tpl.subject;
  const html = renderEmailHtml(config, runtimeVars, { templateKey });
  const subject = renderSubject(subjectTemplate, runtimeVars);
  const text = buildPlainText(config, runtimeVars, { templateKey });
  return { subject, html, text };
}

function parseFormConfig(body) {
  return {
    bannerMode: body.bannerMode || 'color',
    bannerColor: String(body.bannerColor || '#a82e42').trim(),
    bannerImageUrl: String(body.bannerImageUrl || '').trim(),
    bannerText: String(body.bannerText || '').trim(),
    eventName: String(body.eventName || '').trim(),
    greetingPrefix: String(body.greetingPrefix || 'Xin chào').trim(),
    content1: String(body.content1 || '').trim(),
    content2: String(body.content2 || '').trim(),
    showQr: body.showQr === 'on' || body.showQr === true || body.showQr === '1',
    qrIntro: String(body.qrIntro || '').trim(),
    qrCaption: String(body.qrCaption || '').trim(),
    qrFallback: String(body.qrFallback || '').trim(),
    showCta: body.showCta === 'on' || body.showCta === true || body.showCta === '1',
    ctaLabel: String(body.ctaLabel || '').trim(),
    showDetailTable: body.showDetailTable === 'on' || body.showDetailTable === true || body.showDetailTable === '1',
    otpHighlight: body.otpHighlight === 'on' || body.otpHighlight === true || body.otpHighlight === '1',
    footerBgColor: String(body.footerBgColor || '#5c1a28').trim(),
    footerTextColor: String(body.footerTextColor || '#ffffff').trim(),
    footerBody: String(body.footerBody || '').trim(),
  };
}

async function updateFromAdmin(templateKey, body) {
  const row = await emailTemplateRepository.findByKey(templateKey);
  if (!row) throw httpError('Template not found', 404);

  const subject = String(body.subject || '').trim();
  if (!subject) throw httpError('Tiêu đề email là bắt buộc');

  const config = parseFormConfig(body);
  const isEnabled = body.isEnabled === 'on' || body.isEnabled === true || body.isEnabled === '1';

  return emailTemplateRepository.updateByKey(templateKey, {
    subject,
    configJson: JSON.stringify(config),
    isEnabled,
  });
}

async function resetToDefault(templateKey) {
  const meta = TEMPLATE_META.find((m) => m.key === templateKey);
  if (!meta) throw httpError('Template not found', 404);
  return emailTemplateRepository.updateByKey(templateKey, {
    subject: defaultSubject(templateKey),
    configJson: JSON.stringify(defaultConfig(templateKey)),
    isEnabled: true,
  });
}

function getMetaList() {
  return TEMPLATE_META;
}

module.exports = {
  EMAIL_TEMPLATE_KEYS,
  ensureSeeded,
  listForAdmin,
  getForAdmin,
  render,
  updateFromAdmin,
  resetToDefault,
  getMetaList,
  parseConfigJson,
};
