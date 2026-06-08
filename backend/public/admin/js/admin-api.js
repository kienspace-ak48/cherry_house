const AdminApi = {
  async get(path) {
    const res = await fetch(`/api${path}`, {
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'API error');
    return json.data;
  },

  async getDashboardOverview(period = 'week') {
    return this.get(`/admin/dashboard/overview?period=${encodeURIComponent(period)}`);
  },

  formatVnd(amount) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
  },

  kindLabel(kind) {
    const map = {
      homestay: 'Homestay',
      mini_hotel: 'Mini Hotel',
      villa: 'Villa',
      serviced_apartment: 'Căn hộ DV',
    };
    return map[kind] || kind;
  },

  statusBadge(status) {
    const map = {
      available: 'success',
      pending: 'warning',
      booked: 'secondary',
      pending_payment: 'warning',
      confirmed: 'success',
      cancelled: 'danger',
      completed: 'info',
      paid: 'success',
      failed: 'danger',
    };
    return map[status] || 'secondary';
  },

  showError(el, err) {
    if (!el) return;
    el.classList.remove('d-none');
    el.textContent = err instanceof Error ? err.message : String(err);
  },
};

window.AdminApi = AdminApi;
