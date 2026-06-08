const CNAME = 'mail.service.js ';
// const nodemailer = require('nodemailer');
const transporter = require('../config/sendMail.config');
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

    async sendMail(data) {
        try {
            const htmlContent = data.html || `
            <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
                <h1>${data.subject}</h1>
                <p>${data.text}</p>
            </div>
            `;
            const payload ={
                from: `"Cherry House" <info.cherryhouse.vn>`,
                to: data.to,
                subject: data.subject,
                html: htmlContent,
            }
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