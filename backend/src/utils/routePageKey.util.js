/**
 * Ánh xạ pathname React Router → pageKey trong admin SEO.
 * @param {string} pathname
 */
function resolvePageKeyFromPath(pathname) {
  const path = String(pathname || '/').replace(/\/+$/, '') || '/';

  if (path === '/') return 'home';
  if (path === '/about') return 'about';
  if (path === '/contact') return 'contact';
  if (path === '/properties') return 'properties';
  if (path === '/booking' || path === '/rooms') return 'booking';
  if (path === '/login') return 'login';
  if (path === '/register' || path === '/register/email') return 'register';
  if (path === '/profile') return 'profile';
  if (path === '/checkout') return 'checkout';
  if (path === '/checkout/result') return 'checkout_result';

  if (/^\/properties\/[^/]+\/branches$/.test(path)) return 'branch_select';
  if (/^\/properties\/[^/]+\/branches\/[^/]+$/.test(path)) return 'branch';
  if (/^\/properties\/[^/]+$/.test(path)) return 'property';
  if (/^\/room\/[^/]+$/.test(path)) return 'room';

  return null;
}

module.exports = { resolvePageKeyFromPath };
