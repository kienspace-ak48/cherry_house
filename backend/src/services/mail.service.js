const CNAME = 'mail.service.js ';
// const nodemailer = require('nodemailer');
const transporter = require('../config/sendMail.config');
class MailService {
    constructor(){
        console.log(CNAME, 'init')
    }
    async sendMail(data) {
        try {
            const htmlContent =`
            <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
                <h1>${data.subject}</h1>
                <p>${data.text}</p>
                <p>Thank you for your message.</p>
            </div>
            `
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