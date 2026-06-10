/** Liên hệ checkout / hồ sơ — ưu tiên tài khoản đăng nhập, không dùng tên demo. */

import { getClientUser } from '../lib/authStorage';

const STORAGE_KEY = 'cherry_house_profile_contact';

const EMPTY_CONTACT = {
  fullName: '',
  phone: '',
  email: '',
};

/** Dữ liệu demo cũ — bỏ qua nếu user đã đăng nhập account khác */
const LEGACY_DEMO = {
  fullName: 'Nguyễn Minh Quân',
  email: 'quan.nguyen@example.com',
};

function safeParse(raw) {
  try {
    const o = JSON.parse(raw);
    if (!o || typeof o !== 'object') return {};
    return o;
  } catch {
    return {};
  }
}

function isLegacyDemoContact(stored) {
  const email = String(stored.email || '').trim().toLowerCase();
  const name = String(stored.fullName || '').trim();
  return (
    email === LEGACY_DEMO.email.toLowerCase()
    || name === LEGACY_DEMO.fullName
  );
}

/** @param {Record<string, unknown> | null | undefined} user */
export function contactFromUser(user) {
  if (!user) return { ...EMPTY_CONTACT };
  return {
    fullName: typeof user.fullName === 'string' ? user.fullName.trim() : '',
    phone: typeof user.phone === 'string' ? user.phone.trim() : '',
    email: typeof user.email === 'string' ? user.email.trim() : '',
  };
}

export function readProfileContact() {
  if (typeof window === 'undefined') return { ...EMPTY_CONTACT };

  const authUser = getClientUser();
  const authBase = contactFromUser(authUser);
  const stored = safeParse(window.localStorage.getItem(STORAGE_KEY));
  const useStored = Object.keys(stored).length > 0 && !(authUser && isLegacyDemoContact(stored));

  return {
    fullName:
      (useStored && typeof stored.fullName === 'string' && stored.fullName.trim())
        ? stored.fullName.trim()
        : authBase.fullName,
    phone:
      (useStored && typeof stored.phone === 'string' && stored.phone.trim())
        ? stored.phone.trim()
        : authBase.phone,
    email: authBase.email
      || (useStored && typeof stored.email === 'string' && stored.email.trim()
        ? stored.email.trim()
        : ''),
  };
}

/** Ghi đè một phần trường (sau khi lưu ở /profile). */
export function mergeProfileContact(patch) {
  if (typeof window === 'undefined') return readProfileContact();
  const prev = readProfileContact();
  const next = {
    ...prev,
    ...(typeof patch.fullName === 'string' ? { fullName: patch.fullName } : {}),
    ...(typeof patch.phone === 'string' ? { phone: patch.phone } : {}),
    ...(typeof patch.email === 'string' ? { email: patch.email } : {}),
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

/** Đồng bộ localStorage từ user API sau login / refresh profile */
export function syncProfileContactFromUser(user) {
  const contact = contactFromUser(user);
  if (typeof window === 'undefined') return contact;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(contact));
  return contact;
}
