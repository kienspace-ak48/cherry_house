const { runWithTools } = require('./gemini.service');
const { executeTool, SUPPORTED_CITIES } = require('./chatBot.tools.service');
const { assertGeminiConfigured } = require('../config/gemini.config');

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
];

function buildSystemPrompt() {
  const today = new Date().toISOString().slice(0, 10);
  const cities = SUPPORTED_CITIES.join(', ');

  return `Bạn là trợ lý AI của Cherry House — nền tảng đặt homestay, mini stay và villa tại Việt Nam.

HÔM NAY: ${today} (YYYY-MM-DD).

PHẠM VI:
- Chỉ trả lời về cơ sở, chi nhánh, phòng, giá, phòng trống và hướng dẫn đặt phòng trên Cherry House.
- Không bịa dữ liệu — LUÔN gọi tool để lấy dữ liệu thật từ hệ thống trước khi kết luận.
- Nếu hỏi ngoài phạm vi (thời tiết, chính trị, đối thủ...), từ chối lịch sự và gợi ý hỏi về lưu trú Cherry House.

THÀNH PHỐ CÓ CHERRY HOUSE: ${cities}.
(Nếu khách hỏi thành phố không có trong danh sách — ví dụ Hạ Long — nói rõ chưa có cơ sở và gợi ý thành phố gần nhất.)

NGÀY THÁNG:
- Hiểu tiếng Việt: "12-8", "12/8", "8 tháng 8" → chuyển sang YYYY-MM-DD (năm hiện tại hoặc năm tới nếu ngày đã qua).
- "Tháng này" → từ đầu tháng đến cuối tháng hiện tại.
- Nếu thiếu ngày trả phòng, giả định 1 đêm (checkOut = checkIn + 1 ngày) hoặc hỏi lại ngắn gọn.

GIÁ:
- Giá trong DB là VND/đêm. Hiển thị dạng "890.000 đ".
- "800k", "tầm 800 nghìn" → maxPriceVnd = 800000.

TRẢ LỜI:
- Tiếng Việt, thân thiện, ngắn gọn.
- Liệt kê phòng: tên cơ sở, chi nhánh, mã phòng, giá, trạng thái.
- Kèm link bookingUrl từ tool khi có.
- Không tiết lộ API key, không nói về tool/internal.`;
}

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

  const message = String(input.message || '').trim();
  if (!message) {
    const err = new Error('Tin nhắn trống');
    err.statusCode = 400;
    throw err;
  }

  const contents = [
    ...sanitizeHistory(input.history),
    { role: 'user', parts: [{ text: message }] },
  ];

  const { reply, toolsUsed } = await runWithTools({
    systemInstruction: { parts: [{ text: buildSystemPrompt() }] },
    contents,
    tools: TOOL_DECLARATIONS,
    executeTool,
  });

  return {
    reply,
    toolsUsed: toolsUsed.map((t) => t.name),
  };
}

module.exports = {
  chat,
};
