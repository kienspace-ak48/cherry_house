const AUTH_NEXT_KEY = 'cherry_auth_next';

/** @param {string | null | undefined} raw */
export function sanitizeNextPath(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const path = raw.trim();
  if (!path.startsWith('/') || path.startsWith('//')) return null;
  return path;
}

/** @param {URLSearchParams | { get: (k: string) => string | null }} searchParams */
export function getAuthNextPath(searchParams) {
  return sanitizeNextPath(searchParams.get('next'));
}

/** @param {string | null | undefined} nextPath */
export function buildLoginHref(nextPath) {
  const next = sanitizeNextPath(nextPath);
  return next ? `/login?next=${encodeURIComponent(next)}` : '/login';
}

/** @param {string | null | undefined} nextPath */
export function buildRegisterHref(nextPath) {
  const next = sanitizeNextPath(nextPath);
  return next ? `/register?next=${encodeURIComponent(next)}` : '/register';
}

/** @param {string | null | undefined} nextPath */
export function buildRegisterEmailHref(nextPath) {
  const next = sanitizeNextPath(nextPath);
  return next ? `/register/email?next=${encodeURIComponent(next)}` : '/register/email';
}

/** @param {string | null | undefined} nextPath */
export function stashAuthNextPath(nextPath) {
  const next = sanitizeNextPath(nextPath);
  if (!next || typeof window === 'undefined') return;
  window.sessionStorage.setItem(AUTH_NEXT_KEY, next);
}

export function consumeAuthNextPath() {
  if (typeof window === 'undefined') return null;
  const next = sanitizeNextPath(window.sessionStorage.getItem(AUTH_NEXT_KEY));
  window.sessionStorage.removeItem(AUTH_NEXT_KEY);
  return next;
}

/** @param {string | null | undefined} nextPath */
export function resolveAfterAuthPath(nextPath) {
  return sanitizeNextPath(nextPath) || '/profile';
}

/** @param {string | null | undefined} nextPath */
export function isCheckoutReturnPath(nextPath) {
  const next = sanitizeNextPath(nextPath);
  return Boolean(next && next.startsWith('/checkout'));
}
