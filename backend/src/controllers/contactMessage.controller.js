const contactMessageService = require('../services/contactMessage.service');

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || null;
}

async function submit(req, res) {
  try {
    const row = await contactMessageService.submitFromPublic(req.body, {
      ipAddress: clientIp(req),
      userAgent: typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : null,
    });
    res.status(201).json({
      success: true,
      message: 'Cảm ơn bạn — Cherry House đã nhận tin nhắn và sẽ phản hồi sớm.',
      data: { id: row.id },
    });
  } catch (error) {
    res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || 'Không gửi được tin nhắn',
    });
  }
}

module.exports = { submit };
