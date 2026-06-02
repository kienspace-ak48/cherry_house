const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587, //587 TSL false: ket noi thuong->nang cap TLS | 465 SSL true: ma hoa ngay tu dau
    secure: false, //
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
    }
});

module.exports = transporter;