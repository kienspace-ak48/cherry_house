const emailTemplateService = require('../services/emailTemplate.service');
const { renderEmailHtml } = require('../utils/emailLayout.util');
const { renderAdminPage } = require('../utils/adminRender');

async function index(req, res) {
  try {
    const templates = await emailTemplateService.listForAdmin();
    renderAdminPage(req, res, 'admin/email-templates/index', {
      pageTitle: 'Mẫu email',
      adminPage: 'email-templates',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Mẫu email' },
      ],
      templates,
      flash: req.query.flash || null,
      msg: req.query.msg || null,
    });
  } catch (error) {
    renderAdminPage(req, res, 'admin/email-templates/index', {
      pageTitle: 'Mẫu email',
      adminPage: 'email-templates',
      breadcrumbs: [{ label: 'Dashboard', href: '/admin' }, { label: 'Mẫu email' }],
      templates: [],
      flash: 'error',
      msg: error.message,
    });
  }
}

async function editForm(req, res) {
  try {
    const template = await emailTemplateService.getForAdmin(req.params.key);
    renderAdminPage(req, res, 'admin/email-templates/form', {
      pageTitle: `Email: ${template.name}`,
      adminPage: 'email-templates',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Mẫu email', href: '/admin/email-templates' },
        { label: template.name },
      ],
      template,
      flash: req.query.flash || null,
      msg: req.query.msg || null,
    });
  } catch (error) {
    res.redirect(`/admin/email-templates?flash=error&msg=${encodeURIComponent(error.message)}`);
  }
}

async function update(req, res) {
  try {
    await emailTemplateService.updateFromAdmin(req.params.key, req.body);
    res.redirect(`/admin/email-templates/${req.params.key}?flash=saved`);
  } catch (error) {
    res.redirect(
      `/admin/email-templates/${req.params.key}?flash=error&msg=${encodeURIComponent(error.message)}`,
    );
  }
}

async function reset(req, res) {
  try {
    await emailTemplateService.resetToDefault(req.params.key);
    res.redirect(`/admin/email-templates/${req.params.key}?flash=reset`);
  } catch (error) {
    res.redirect(
      `/admin/email-templates/${req.params.key}?flash=error&msg=${encodeURIComponent(error.message)}`,
    );
  }
}

async function previewAjax(req, res) {
  try {
    const template = await emailTemplateService.getForAdmin(req.params.key);
    const sampleVars = buildSampleVars(req.params.key);
    const html = renderEmailHtml(template.config, sampleVars, { templateKey: req.params.key });
    res.json({ success: true, html });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

function buildSampleVars(key) {
  const base = {
    guest_name: 'Nguyễn Văn Khách',
    full_name: 'Nguyễn Văn Khách',
    greeting_name: 'Nguyễn Văn Khách',
    cta_url: 'https://cherryhouse.vn/booking',
    qr_code_data_url: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#f4f6f8" width="200" height="200"/><text x="50%" y="50%" text-anchor="middle" fill="#a82e42" font-size="14">QR mẫu</text></svg>'),
  };
  if (key === 'booking_confirmation') {
    return {
      ...base,
      booking_code: 'CH-DEMO123-ABC',
      property_name: 'Cherry Villa Đà Lạt',
      branch_name: 'Trung tâm',
      room_code: 'P-201',
      check_in: '15 tháng 6, 2026',
      check_out: '17 tháng 6, 2026',
      nights: 2,
      guest_line: '2 người lớn',
      guest_phone: '0901234567',
      guest_email: 'guest@cherryhouse.vn',
      total_vnd: '1.200.000 ₫',
      price_per_night: '600.000 ₫',
      special_note: 'Giường đôi, view núi',
      result_url: 'https://cherryhouse.vn/checkout/result?bookingCode=CH-DEMO',
    };
  }
  if (key === 'registration_otp') {
    return { ...base, otp_code: '847291' };
  }
  if (key === 'promo_coupon') {
    return {
      ...base,
      coupon_code: 'CHERRY10',
      discount_text: 'Giảm 10%',
      min_order_text: 'Không yêu cầu',
      valid_from: '01/01/2026',
      valid_to: '31/12/2026',
      description: 'Áp dụng toàn hệ thống',
      cta_url: 'https://cherryhouse.vn/booking',
    };
  }
  return base;
}

module.exports = {
  index,
  editForm,
  update,
  reset,
  previewAjax,
};
