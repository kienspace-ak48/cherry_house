/** Admin dùng cookie httpOnly (login tại /auth/login) — không check localStorage */
window.AdminAuth = {
  logout() {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/auth/logout';
    document.body.appendChild(form);
    form.submit();
  },
};
