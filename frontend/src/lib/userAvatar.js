import { DEFAULT_USER_AVATAR_URL } from '../constants/defaultUserAvatar';

/** Bảng màu kiểu Google — màu ổn định theo tên, không đổi mỗi lần render. */
const AVATAR_COLORS = [
  '#1A73E8',
  '#D93025',
  '#F9AB00',
  '#1E8E3E',
  '#9334E6',
  '#E8710A',
  '#0B8043',
  '#AB47BC',
  '#00ACC1',
  '#5C6BC0',
  '#8E24AA',
  '#546E7A',
  '#E91E63',
  '#3949AB',
  '#00897B',
];

/**
 * Một chữ cái đầu tên (giống avatar Google).
 * @param {string} [fullName]
 */
export function getAvatarInitial(fullName) {
  const firstWord = String(fullName || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)[0];
  const ch = firstWord?.[0] || 'C';
  return ch.toUpperCase();
}

/**
 * @param {string} [seed] — thường là fullName hoặc email
 */
export function getAvatarColor(seed) {
  const s = String(seed || 'Cherry House').trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < s.length; i += 1) {
    hash = s.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/**
 * @param {string} [avatarUrl]
 */
export function isPlaceholderAvatarUrl(avatarUrl) {
  const raw = String(avatarUrl || '').trim();
  if (!raw) return true;
  return raw === DEFAULT_USER_AVATAR_URL || raw.endsWith('/default-user-avatar.svg');
}
