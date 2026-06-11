const contactMessageService = require('../services/contactMessage.service');
const userRepository = require('../repositories/user.repository');
const { getClientAppUrl } = require('../config/appUrl.config');
const { renderAdminPage } = require('../utils/adminRender');

const contactPageUrl = `${getClientAppUrl()}/contact`;

function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('vi-VN');
}

function excerpt(text, max = 80) {
  const s = String(text || '').trim();
  if (s.length <= max) return s;
  return `${s.slice(0, max)}…`;
}

function buildListQuery(parts = {}) {
  const params = new URLSearchParams();
  Object.entries(parts).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

async function list(req, res) {
  try {
    const searchQ = req.query.q ? String(req.query.q).trim() : '';
    const filterStatus = req.query.status ? String(req.query.status) : '';
    const { items, total, newCount, statusCounts } = await contactMessageService.listForAdmin({
      q: searchQ || undefined,
      status: filterStatus || undefined,
    });

    renderAdminPage(req, res, 'admin/contact-messages/index', {
      pageTitle: 'Tin liên hệ',
      adminPage: 'contact-messages',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Tin liên hệ' },
      ],
      messages: items,
      total,
      newCount,
      statusCounts,
      searchQ,
      filterStatus,
      listQueryBase: { q: searchQ, status: filterStatus },
      statuses: contactMessageService.STATUSES,
      statusMeta: contactMessageService.statusMeta,
      formatDateTime,
      excerpt,
      buildListQuery,
      contactPageUrl,
      flash: req.query.flash || null,
      msg: req.query.msg || null,
    });
  } catch (error) {
    renderAdminPage(req, res, 'admin/contact-messages/index', {
      pageTitle: 'Tin liên hệ',
      adminPage: 'contact-messages',
      breadcrumbs: [{ label: 'Dashboard', href: '/admin' }, { label: 'Tin liên hệ' }],
      messages: [],
      total: 0,
      newCount: 0,
      statusCounts: {},
      searchQ: '',
      filterStatus: '',
      listQueryBase: {},
      buildListQuery,
      statuses: contactMessageService.STATUSES,
      statusMeta: contactMessageService.statusMeta,
      formatDateTime,
      excerpt,
      contactPageUrl,
      formError: error.message,
    });
  }
}

async function detail(req, res) {
  try {
    const message = await contactMessageService.getByIdForAdmin(req.params.id, { markRead: true });
    const linkedUser = await userRepository.findByEmail(message.email);
    renderAdminPage(req, res, 'admin/contact-messages/detail', {
      pageTitle: `Tin #${message.id}`,
      adminPage: 'contact-messages',
      breadcrumbs: [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Tin liên hệ', href: '/admin/contact-messages' },
        { label: `#${message.id}` },
      ],
      message,
      linkedUser,
      mailReplyUrl: contactMessageService.buildMailReplyUrl(message),
      statuses: contactMessageService.STATUSES,
      statusMeta: contactMessageService.statusMeta,
      formatDateTime,
      flash: req.query.flash || null,
      msg: req.query.msg || null,
    });
  } catch (error) {
    res.redirect(`/admin/contact-messages?flash=error&msg=${encodeURIComponent(error.message)}`);
  }
}

async function update(req, res) {
  try {
    await contactMessageService.updateFromAdmin(req.params.id, req.body);
    res.redirect(`/admin/contact-messages/${req.params.id}?flash=updated`);
  } catch (error) {
    res.redirect(
      `/admin/contact-messages/${req.params.id}?flash=error&msg=${encodeURIComponent(error.message)}`,
    );
  }
}

async function remove(req, res) {
  try {
    await contactMessageService.remove(req.params.id);
    res.redirect('/admin/contact-messages?flash=deleted');
  } catch (error) {
    res.redirect(
      `/admin/contact-messages/${req.params.id}?flash=error&msg=${encodeURIComponent(error.message)}`,
    );
  }
}

module.exports = {
  list,
  detail,
  update,
  remove,
};
