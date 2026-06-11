const StaffApi = {
  async get(path) {
    const res = await fetch(`/api${path}`, {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'API error');
    return json.data;
  },
};

document.getElementById('staffMenuToggle')?.addEventListener('click', () => {
  document.getElementById('staffSidebar')?.classList.toggle('open');
});
