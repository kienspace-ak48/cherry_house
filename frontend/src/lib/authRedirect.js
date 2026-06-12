const AUTH_NEXT_KEY = 'cherry_auth_next';

const AUTH_RESUME_ROUTE_RE = /^\/(login|register(?:\/email)?|forgot-password|reset-password)(\/|$)/;

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

export function peekAuthNextPath() {
  if (typeof window === 'undefined') return null;
  return sanitizeNextPath(window.sessionStorage.getItem(AUTH_NEXT_KEY));
}

/**
 * URL `next` ưu tiên; khi đang ở trang auth có thể đọc thêm sessionStorage (sau redirect từ checkout).
 * @param {URLSearchParams | { get: (k: string) => string | null }} searchParams
 * @param {{ allowStash?: boolean }} [options]
 */
export function getEffectiveAuthNextPath(searchParams, { allowStash = false } = {}) {
  return getAuthNextPath(searchParams) || (allowStash ? peekAuthNextPath() : null);
}

/** @param {string | null | undefined} pathname */
export function isAuthResumeRoute(pathname) {
  return AUTH_RESUME_ROUTE_RE.test(pathname || '');
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

/**
 * @param {string | null | undefined} nextPath
 * @param {{ consumeStash?: boolean }} [options]
 */
export function resolveAfterAuthPath(nextPath, { consumeStash = false } = {}) {
  const fromUrl = sanitizeNextPath(nextPath);
  if (fromUrl) {
    if (consumeStash) consumeAuthNextPath();
    return fromUrl;
  }
  if (consumeStash) {
    return consumeAuthNextPath() || '/profile';
  }
  return peekAuthNextPath() || '/profile';
}

/** @param {string | null | undefined} nextPath */
export function isCheckoutReturnPath(nextPath) {
  const next = sanitizeNextPath(nextPath);
  return Boolean(next && next.startsWith('/checkout'));
}

/**
 * React Router cần tách pathname/search khi `next` chứa query (vd. /checkout?property=…).
 * @param {string | null | undefined} path
 */
export function toNavigateTarget(path) {
  const safe = sanitizeNextPath(path) || '/profile';
  const qIndex = safe.indexOf('?');
  if (qIndex === -1) return safe;
  return {
    pathname: safe.slice(0, qIndex),
    search: safe.slice(qIndex),
  };
}

/**
 * @param {import('react-router-dom').NavigateFunction} navigate
 * @param {string | null | undefined} nextPath
 * @param {{ replace?: boolean; consumeStash?: boolean }} [options]
 */
export function navigateAfterAuth(navigate, nextPath, { replace = true, consumeStash = true } = {}) {
  const resolved = resolveAfterAuthPath(nextPath, { consumeStash });
  navigate(toNavigateTarget(resolved), { replace });
}
