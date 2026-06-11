const { runWithTools } = require('./gemini.service');
const { executeTool } = require('./chatBot.tools.service');
const { assertGeminiConfigured } = require('../config/gemini.config');
const chatBotConfigService = require('./chatBotConfig.service');
const {
  buildSmartFallbackReply,
  needsSmartFallback,
} = require('./chatBot.fallback.service');

const TOOL_DECLARATIONS = [
  {
    name: 'list_properties',
    description: 'Liệt kê cơ sở lưu trú Cherry House theo thành phố hoặc loại hình.',
    parameters: {
      type: 'object',
      properties: {
        city: { type: 'string', description: 'Thành phố, VD: Đà Lạt, Hà Nội' },
        kind: {
          type: 'string',
          description: 'homestay | mini_hotel | villa | serviced_apartment',
        },
      },
    },
  },
  {
    name: 'get_property_detail',
    description: 'Chi tiết một cơ sở theo slug.',
    parameters: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'property slug, VD: cherry-house-da-lat' },
      },
      required: ['slug'],
    },
  },
  {
    name: 'search_available_rooms',
    description:
      'Tìm phòng còn trống (hoặc giá tham khảo) theo thành phố, ngày, ngân sách. Dùng cho hầu hết câu hỏi đặt phòng.',
    parameters: {
      type: 'object',
      properties: {
        city: { type: 'string', description: 'Thành phố' },
        checkIn: { type: 'string', description: 'Ngày nhận phòng YYYY-MM-DD' },
        checkOut: { type: 'string', description: 'Ngày trả phòng YYYY-MM-DD' },
        maxPriceVnd: { type: 'number', description: 'Giá tối đa mỗi đêm (VND), VD 800000' },
        sortBy: {
          type: 'string',
          description: 'cheapest để sắp giá thấp nhất trước',
          enum: ['cheapest', 'price_asc', 'default'],
        },
        limit: { type: 'number', description: 'Số phòng tối đa trả về (mặc định 12)' },
      },
    },
  },
  {
    name: 'get_branch_room_status',
    description: 'Trạng thái từng phòng tại một chi nhánh cụ thể trong khoảng ngày.',
    parameters: {
      type: 'object',
      properties: {
        propertySlug: { type: 'string' },
        branchCode: { type: 'string', description: 'Mã chi nhánh, VD: dl-hxh' },
        checkIn: { type: 'string' },
        checkOut: { type: 'string' },
      },
      required: ['propertySlug', 'branchCode'],
    },
  },
  {
    name: 'get_room_quote',
    description:
      'Giá và trạng thái một phòng cụ thể theo mã (kể cả đã đặt/giữ chỗ). Dùng khi khách hỏi giá phòng X, VD: HN-102, HK-102.',
    parameters: {
      type: 'object',
      properties: {
        roomCode: { type: 'string', description: 'Mã phòng, VD: HN-102' },
        city: { type: 'string', description: 'Thành phố để thu hẹp tìm kiếm' },
        propertySlug: { type: 'string' },
        branchCode: { type: 'string' },
        branchNameHint: { type: 'string', description: 'Tên chi nhánh, VD: Hoàn Kiếm' },
        checkIn: { type: 'string' },
        checkOut: { type: 'string' },
      },
      required: ['roomCode'],
    },
  },
];

function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant'))
    .slice(-10)
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(m.content || '').slice(0, 2000) }],
    }));
}

/**
 * @param {{ message: string; history?: Array<{ role: string; content: string }> }} input
 */
async function chat(input) {
  assertGeminiConfigured();

  const publicConfig = await chatBotConfigService.getPublicConfig();
  if (!publicConfig.isEnabled) {
    const err = new Error('Chatbot tạm tắt. Vui lòng thử lại sau.');
    err.statusCode = 503;
    throw err;
  }

  const message = String(input.message || '').trim();
  if (!message) {
    const err = new Error('Tin nhắn trống');
    err.statusCode = 400;
    throw err;
  }

  const systemPrompt = await chatBotConfigService.getResolvedSystemPrompt();

  const contents = [
    ...sanitizeHistory(input.history),
    { role: 'user', parts: [{ text: message }] },
  ];

  const { reply, toolsUsed } = await runWithTools({
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents,
    tools: TOOL_DECLARATIONS,
    executeTool,
  });

  let finalReply = reply;
  if (needsSmartFallback(finalReply)) {
    const fallback = await buildSmartFallbackReply({ message, toolsUsed });
    if (fallback) finalReply = fallback;
  }

  return {
    reply: finalReply,
    toolsUsed: toolsUsed.map((t) => t.name),
  };
}

module.exports = {
  chat,
};
