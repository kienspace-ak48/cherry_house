const {
  getGeminiApiKey,
  getGeminiModelCandidates,
  assertGeminiConfigured,
} = require('../config/gemini.config');

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseRetryDelayMs(message) {
  const match = String(message || '').match(/retry in ([\d.]+)s/i);
  if (!match) return 6000;
  return Math.min(Math.ceil(Number(match[1]) * 1000) + 500, 30000);
}

function isQuotaOrRateLimitError(status, message) {
  const text = String(message || '').toLowerCase();
  return status === 429
    || text.includes('quota')
    || text.includes('rate limit')
    || text.includes('resource_exhausted')
    || text.includes('free_tier');
}

function toFriendlyError(rawMessage, status) {
  const msg = String(rawMessage || '');
  if (isQuotaOrRateLimitError(status, msg)) {
    if (/limit:\s*0/i.test(msg) || /free_tier.*limit:\s*0/i.test(msg)) {
      return [
        'Model Gemini hiện tại không còn trong gói miễn phí của project (quota = 0).',
        'Trong backend/.env đặt: GOOGLE_AI_MODEL=gemini-2.5-flash-lite',
        'Hoặc bật billing tại https://aistudio.google.com → Settings → Billing.',
        'Xem quota: https://ai.dev/rate-limit',
      ].join(' ');
    }
    return 'Chat AI tạm hết lượt (rate limit). Vui lòng đợi vài giây rồi thử lại.';
  }
  if (status === 403 || /api key/i.test(msg)) {
    return 'API key Gemini không hợp lệ. Kiểm tra GOOGLE_AI_STUDIO_API_KEY trong .env.';
  }
  return msg || 'Lỗi kết nối Gemini API';
}

/**
 * @param {string} model
 * @param {object} body
 */
async function generateContentForModel(model, body) {
  const key = getGeminiApiKey();
  const url = `${API_BASE}/models/${model}:generateContent?key=${encodeURIComponent(key)}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json?.error?.message || `Gemini API error (${res.status})`;
    const err = new Error(msg);
    err.statusCode = res.status;
    err.rawMessage = msg;
    err.isQuota = isQuotaOrRateLimitError(res.status, msg);
    throw err;
  }

  return { json, model };
}

/**
 * Thử lần lượt các model + retry ngắn khi 429.
 */
async function generateContent(body) {
  assertGeminiConfigured();
  const models = getGeminiModelCandidates();
  let lastError = null;

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const { json } = await generateContentForModel(model, body);
        return json;
      } catch (error) {
        lastError = error;
        if (error.isQuota && attempt === 0) {
          await sleep(parseRetryDelayMs(error.rawMessage || error.message));
          continue;
        }
        if (error.isQuota) break;
        throw Object.assign(new Error(toFriendlyError(error.rawMessage || error.message, error.statusCode)), {
          statusCode: error.statusCode === 429 ? 429 : 502,
        });
      }
    }
  }

  const friendly = toFriendlyError(lastError?.rawMessage || lastError?.message, lastError?.statusCode);
  const err = new Error(friendly);
  err.statusCode = lastError?.statusCode === 429 ? 429 : 503;
  throw err;
}

function extractParts(candidate) {
  return candidate?.content?.parts || [];
}

function extractText(parts) {
  return parts
    .filter((p) => typeof p.text === 'string')
    .map((p) => p.text)
    .join('')
    .trim();
}

function extractFunctionCalls(parts) {
  return parts
    .filter((p) => p.functionCall?.name)
    .map((p) => ({
      name: p.functionCall.name,
      args: p.functionCall.args || {},
    }));
}

async function runWithTools(input) {
  const {
    systemInstruction,
    contents,
    tools,
    executeTool,
    maxRounds = 6,
  } = input;

  const workingContents = [...contents];
  const toolsUsed = [];

  for (let round = 0; round < maxRounds; round += 1) {
    const response = await generateContent({
      systemInstruction,
      contents: workingContents,
      tools: [{ functionDeclarations: tools }],
      toolConfig: { functionCallingConfig: { mode: 'AUTO' } },
    });

    const candidate = response.candidates?.[0];
    const parts = extractParts(candidate);
    const calls = extractFunctionCalls(parts);

    if (!calls.length) {
      const text = extractText(parts);
      const finishReason = candidate?.finishReason || null;
      if (!text && finishReason) {
        console.warn('[gemini] empty text, finishReason:', finishReason);
      }
      return {
        reply: text || 'Xin lỗi, tôi chưa trả lời được. Bạn thử hỏi lại nhé.',
        toolsUsed,
        finishReason,
      };
    }

    workingContents.push({
      role: 'model',
      parts: calls.map((c) => ({ functionCall: { name: c.name, args: c.args } })),
    });

    const responseParts = [];
    for (const call of calls) {
      let result;
      try {
        result = await executeTool(call.name, call.args);
      } catch (error) {
        result = { error: error.message || 'Tool failed' };
      }
      toolsUsed.push({ name: call.name, args: call.args, result });
      responseParts.push({
        functionResponse: {
          name: call.name,
          response: { result },
        },
      });
    }

    workingContents.push({
      role: 'user',
      parts: responseParts,
    });
  }

  return {
    reply: 'Yêu cầu hơi phức tạp — bạn thử hỏi ngắn gọn hơn (thành phố, ngày nhận–trả, ngân sách).',
    toolsUsed,
  };
}

module.exports = {
  generateContent,
  runWithTools,
};
