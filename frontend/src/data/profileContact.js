/** Demo: canonical contact synced between /profile và /checkout via localStorage. */

const STORAGE_KEY = 'cherry_house_profile_contact';

export const DEFAULT_PROFILE_CONTACT = {
  fullName: 'Nguyễn Minh Quân',
  phone: '+84 901 234 567',
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

export function readProfileContact() {
  if (typeof window === 'undefined') return { ...DEFAULT_PROFILE_CONTACT };
  const stored = safeParse(window.localStorage.getItem(STORAGE_KEY));
  return {
    fullName: typeof stored.fullName === 'string' && stored.fullName.trim()
      ? stored.fullName.trim()
      : DEFAULT_PROFILE_CONTACT.fullName,
    phone:
      typeof stored.phone === 'string' && stored.phone.trim()
        ? stored.phone.trim()
        : DEFAULT_PROFILE_CONTACT.phone,
    email:
      typeof stored.email === 'string' && stored.email.trim()
        ? stored.email.trim()
        : DEFAULT_PROFILE_CONTACT.email,
  };
}

/** Ghi đè một phần trường (ví dụ sau khi lưu họ tên ở trang hồ sơ). */
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
