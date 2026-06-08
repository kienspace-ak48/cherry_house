/** @param {Date} date */
export function toIsoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayIso() {
  return toIsoDate(new Date());
}

/** @param {string} iso */
export function parseIso(iso) {
  if (!iso) return null;
  const d = new Date(`${iso}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** @param {string | undefined} checkIn @param {string | undefined} checkOut */
export function countNights(checkIn, checkOut) {
  const start = parseIso(checkIn ?? '');
  const end = parseIso(checkOut ?? '');
  if (!start || !end) return 0;
  const diff = Math.round((end.getTime() - start.getTime()) / 86400000);
  return diff > 0 ? diff : 0;
}

/** @param {string} iso */
export function formatViRangePart(iso) {
  const d = parseIso(iso);
  if (!d) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(d);
}

export const VI_MONTH_LABELS = [
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12',
];

/** @param {number} year @param {number} monthIndex 0-11 */
export function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/** @param {number} year @param {number} monthIndex */
export function startWeekday(year, monthIndex) {
  return new Date(year, monthIndex, 1).getDay();
}

/** @param {string} a @param {string} b */
export function compareIso(a, b) {
  return a.localeCompare(b);
}

/** @param {string} iso @param {number} days */
export function addDaysIso(iso, days) {
  const d = parseIso(iso);
  if (!d) return '';
  d.setDate(d.getDate() + days);
  return toIsoDate(d);
}
