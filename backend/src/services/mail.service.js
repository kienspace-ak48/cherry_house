const CNAME = 'mail.service.js ';
const transporter = require('../config/sendMail.config');

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function mailFrom() {
  const user = process.env.GMAIL_USER;
  return user ? `"Cherry House" <${user}>` : '"Cherry House" <noreply@cherryhouse.vn>';
}

class MailService {
    constructor(){
        console.log(CNAME, 'init')
    }
    async sendRegistrationOtp({ to, fullName, otpCode }) {
        const subject = 'Mã xác thực đăng ký Cherry House';
        const text = `Mã OTP của bạn là ${otpCode}. Có hiệu lực 10 phút.`;
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #333;">
                <h2 style="color: #a82e42;">Xác thực đăng ký Cherry House</h2>
                <p>Xin chào <strong>${fullName}</strong>,</p>
                <p>Mã OTP của bạn (hiệu lực 10 phút):</p>
                <p style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #a82e42;">${otpCode}</p>
                <p style="font-size: 13px; color: #666;">Nếu bạn không yêu cầu đăng ký, hãy bỏ qua email này.</p>
            </div>
        `;
        return this.sendMail({ to, subject, text, html: htmlContent });
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
        totalVnd,
        pricePerNightVnd,
        specialNote,
        resultUrl,
    }) {
        const subject = `[Cherry House] Xác nhận đặt phòng ${bookingCode}`;
        const text = [
            `Xin chào ${guestName},`,
            '',
            'Đặt phòng của bạn đã được xác nhận.',
            `Mã đặt phòng: ${bookingCode}`,
            `Cơ sở: ${propertyName} — ${branchName}`,
            `Phòng: ${roomCode}`,
            `Nhận phòng: ${checkIn}`,
            `Trả phòng: ${checkOut} (${nights} đêm)`,
            `Khách: ${guestLine}`,
            `SĐT: ${guestPhone}`,
            `Tổng thanh toán: ${totalVnd}`,
            specialNote ? `Ghi chú: ${specialNote}` : '',
            '',
            `Xem chi tiết: ${resultUrl}`,
        ].filter(Boolean).join('\n');

        const noteRow = specialNote
            ? `<tr><td style="padding:8px 0;color:#666;">Ghi chú</td><td style="padding:8px 0;">${escapeHtml(specialNote)}</td></tr>`
            : '';

        const htmlContent = `
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#333;">
                <h2 style="color:#a82e42;margin-bottom:8px;">Đặt phòng thành công</h2>
                <p>Xin chào <strong>${escapeHtml(guestName)}</strong>,</p>
                <p>Cảm ơn bạn đã đặt phòng tại Cherry House. Thông tin đặt phòng:</p>
                <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0;">
                    <tr><td style="padding:8px 0;color:#666;width:38%;">Mã đặt phòng</td><td style="padding:8px 0;font-weight:bold;color:#a82e42;">${escapeHtml(bookingCode)}</td></tr>
                    <tr><td style="padding:8px 0;color:#666;">Cơ sở</td><td style="padding:8px 0;">${escapeHtml(propertyName)}</td></tr>
                    <tr><td style="padding:8px 0;color:#666;">Chi nhánh</td><td style="padding:8px 0;">${escapeHtml(branchName)}</td></tr>
                    <tr><td style="padding:8px 0;color:#666;">Phòng</td><td style="padding:8px 0;font-weight:bold;">${escapeHtml(roomCode)}</td></tr>
                    <tr><td style="padding:8px 0;color:#666;">Nhận phòng</td><td style="padding:8px 0;">${escapeHtml(checkIn)}</td></tr>
                    <tr><td style="padding:8px 0;color:#666;">Trả phòng</td><td style="padding:8px 0;">${escapeHtml(checkOut)} (${nights} đêm)</td></tr>
                    <tr><td style="padding:8px 0;color:#666;">Số khách</td><td style="padding:8px 0;">${escapeHtml(guestLine)}</td></tr>
                    <tr><td style="padding:8px 0;color:#666;">Điện thoại</td><td style="padding:8px 0;">${escapeHtml(guestPhone)}</td></tr>
                    <tr><td style="padding:8px 0;color:#666;">Giá / đêm</td><td style="padding:8px 0;">${escapeHtml(pricePerNightVnd)}</td></tr>
                    <tr><td style="padding:8px 0;color:#666;">Tổng thanh toán</td><td style="padding:8px 0;font-weight:bold;font-size:16px;">${escapeHtml(totalVnd)}</td></tr>
                    ${noteRow}
                </table>
                <p style="margin:20px 0;">
                    <a href="${escapeHtml(resultUrl)}" style="display:inline-block;background:#a82e42;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;">Xem đơn đặt phòng</a>
                </p>
                <p style="font-size:12px;color:#888;">Check-in 14:00 · Check-out 12:00. Liên hệ lễ tân nếu cần hỗ trợ.</p>
            </div>
        `;

        return this.sendMail({ to, subject, text, html: htmlContent });
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
            }
        } catch (error) {
            console.log(CNAME, 'sendMail', error);
            return {
                success: false,
                message: error.message,
            }
        }
    }
}
module.exports = new MailService(); //export instance