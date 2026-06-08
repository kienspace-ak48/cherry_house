/** Token khách (React SPA) — tách key với admin panel */

export const CLIENT_TOKEN_KEY = 'cherry_client_token';

export const CLIENT_REFRESH_KEY = 'cherry_client_refresh_token';

export const CLIENT_USER_KEY = 'cherry_client_user';



export function getClientToken() {

  return localStorage.getItem(CLIENT_TOKEN_KEY) || '';

}



export function getClientRefreshToken() {

  return localStorage.getItem(CLIENT_REFRESH_KEY) || '';

}



export function getClientUser() {

  try {

    const raw = localStorage.getItem(CLIENT_USER_KEY);

    return raw ? JSON.parse(raw) : null;

  } catch {

    return null;

  }

}



/**

 * @param {{ token?: string; accessToken?: string; refreshToken?: string; user: object }} session

 */

export function saveClientSession(session) {

  const accessToken = session.accessToken || session.token || '';

  if (accessToken) {

    localStorage.setItem(CLIENT_TOKEN_KEY, accessToken);

  }

  if (session.refreshToken) {

    localStorage.setItem(CLIENT_REFRESH_KEY, session.refreshToken);

  }

  if (session.user) {

    localStorage.setItem(CLIENT_USER_KEY, JSON.stringify(session.user));

  }

}



export function clearClientSession() {

  localStorage.removeItem(CLIENT_TOKEN_KEY);

  localStorage.removeItem(CLIENT_REFRESH_KEY);

  localStorage.removeItem(CLIENT_USER_KEY);

}



export function isClientLoggedIn() {

  return Boolean(getClientToken() || getClientRefreshToken());

}


