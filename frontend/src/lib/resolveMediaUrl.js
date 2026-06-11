/** Chuẩn hóa URL ảnh từ API (absolute hoặc /uploads/...) cho <img src>. */
export function resolveMediaUrl(url) {
  const raw = String(url || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;

  const normalized = raw.startsWith('/') ? raw : `/${raw}`;

  if (import.meta.env.DEV) {
    const apiBase = String(import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(
      /\/$/,
      '',
    );
    const origin = apiBase.replace(/\/api$/i, '');
    return `${origin}${normalized}`;
  }

  return normalized;
}
