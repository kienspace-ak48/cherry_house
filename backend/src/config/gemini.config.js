/** Model mặc định — free tier 2026: dùng Flash-Lite / 2.5 Flash, tránh gemini-2.0-flash (limit 0). */
const DEFAULT_MODEL = 'gemini-2.5-flash-lite';

const DEFAULT_FALLBACK_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
];

function getGeminiApiKey() {
  return String(process.env.GOOGLE_AI_STUDIO_API_KEY || '').trim();
}

function getGeminiModel() {
  return String(process.env.GOOGLE_AI_MODEL || DEFAULT_MODEL).trim();
}

function getGeminiModelCandidates() {
  const primary = getGeminiModel();
  const fromEnv = String(process.env.GOOGLE_AI_MODEL_FALLBACK || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const chain = fromEnv.length ? [primary, ...fromEnv] : [primary, ...DEFAULT_FALLBACK_MODELS];
  return [...new Set(chain)];
}

function assertGeminiConfigured() {
  if (!getGeminiApiKey()) {
    const err = new Error('Chat AI chưa được cấu hình (thiếu GOOGLE_AI_STUDIO_API_KEY)');
    err.statusCode = 503;
    throw err;
  }
}

module.exports = {
  DEFAULT_MODEL,
  DEFAULT_FALLBACK_MODELS,
  getGeminiApiKey,
  getGeminiModel,
  getGeminiModelCandidates,
  assertGeminiConfigured,
};
