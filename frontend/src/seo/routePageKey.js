/**
 * Ánh xạ pathname React Router → pageKey trong admin SEO.
 * @param {string} pathname
 */
export function resolvePageKeyFromPath(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/';

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

  const propertyBranchesMatch = path.match(/^\/properties\/([^/]+)\/branches$/);
  if (propertyBranchesMatch) return 'branch_select';

  const branchMatch = path.match(/^\/properties\/([^/]+)\/branches\/([^/]+)$/);
  if (branchMatch) return 'branch';

  const propertyMatch = path.match(/^\/properties\/([^/]+)$/);
  if (propertyMatch) return 'property';

  const roomMatch = path.match(/^\/room\/([^/]+)$/);
  if (roomMatch) return 'room';

  return null;
}
