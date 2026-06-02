/** Token khách (React SPA) — tách key với admin panel */
export const CLIENT_TOKEN_KEY = 'cherry_client_token';
export const CLIENT_USER_KEY = 'cherry_client_user';

export function getClientToken() {
  return localStorage.getItem(CLIENT_TOKEN_KEY) || '';
}

export function getClientUser() {
  try {
    const raw = localStorage.getItem(CLIENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveClientSession({ token, user }) {
  localStorage.setItem(CLIENT_TOKEN_KEY, token);
  localStorage.setItem(CLIENT_USER_KEY, JSON.stringify(user));
}

export function clearClientSession() {
  localStorage.removeItem(CLIENT_TOKEN_KEY);
  localStorage.removeItem(CLIENT_USER_KEY);
}

export function isClientLoggedIn() {
  return Boolean(getClientToken());
}
