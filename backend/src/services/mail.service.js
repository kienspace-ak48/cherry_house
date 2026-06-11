const CNAME = 'mail.service.js ';
const transporter = require('../config/sendMail.config');
const emailTemplateService = require('./emailTemplate.service');
const { EMAIL_TEMPLATE_KEYS } = require('../config/emailTemplate.defaults');

function mailFrom() {
  const user = process.env.GMAIL_USER;
  return user ? `"Cherry House" <${user}>` : '"Cherry House" <noreply@cherryhouse.vn>';
}

class MailService {
  constructor() {
    console.log(CNAME, 'init');
  }

  async sendRegistrationOtp({ to, fullName, otpCode }) {
    const vars = {
      full_name: fullName,
      guest_name: fullName,
      otp_code: otpCode,
    };
    const rendered = await emailTemplateService.render(
      EMAIL_TEMPLATE_KEYS.REGISTRATION_OTP,
      vars,
    );
    return this.sendMail({ to, subject: rendered.subject, text: rendered.text, html: rendered.html });
  }

  async sendBookingConfirmation({
    to,
    guestName,
    bookingCode,
    propertyName,
    branchName,
    roomCode,
    checkIn,
    checkOut,
    nights,
    guestLine,
    guestPhone,
    guestEmail,
    totalVnd,
    pricePerNightVnd,
    specialNote,
    resultUrl,
    qrCodeDataUrl,
  }) {
    const vars = {
      guest_name: guestName,
      booking_code: bookingCode,
      property_name: propertyName,
      branch_name: branchName,
      room_code: roomCode,
      check_in: checkIn,
      check_out: checkOut,
      nights,
      guest_line: guestLine,
      guest_phone: guestPhone,
      guest_email: guestEmail,
      total_vnd: totalVnd,
      price_per_night: pricePerNightVnd,
      special_note: specialNote || '',
      result_url: resultUrl,
      cta_url: resultUrl,
      qr_code_data_url: qrCodeDataUrl || '',
    };
    const rendered = await emailTemplateService.render(
      EMAIL_TEMPLATE_KEYS.BOOKING_CONFIRMATION,
      vars,
    );
    return this.sendMail({ to, subject: rendered.subject, text: rendered.text, html: rendered.html });
  }

  /** Gửi thông báo coupon — gọi từ admin/marketing khi cần */
  async sendPromoCoupon({
    to,
    guestName,
    couponCode,
    discountText,
    minOrderText,
    validFrom,
    validTo,
    description,
    ctaUrl,
  }) {
    const vars = {
      guest_name: guestName,
      coupon_code: couponCode,
      discount_text: discountText,
      min_order_text: minOrderText,
      valid_from: validFrom,
      valid_to: validTo,
      description: description || '',
      cta_url: ctaUrl || '',
    };
    const rendered = await emailTemplateService.render(
      EMAIL_TEMPLATE_KEYS.PROMO_COUPON,
      vars,
    );
    return this.sendMail({ to, subject: rendered.subject, text: rendered.text, html: rendered.html });
  }

  async sendMail(data) {
    try {
      const htmlContent = data.html || `
            <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
                <h1>${data.subject}</h1>
                <p>${data.text}</p>
            </div>
            `;
      const payload = {
        from: mailFrom(),
        to: data.to,
        subject: data.subject,
        text: data.text,
        html: htmlContent,
      };
      const info = await transporter.sendMail(payload);
      console.log(CNAME, 'sendMail', info);
      return {
        success: true,
        message_id: info.messageId,
      };
    } catch (error) {
      console.log(CNAME, 'sendMail', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }
}

module.exports = new MailService();
