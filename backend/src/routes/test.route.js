const express = require("express");
const router = express.Router();
const mailService = require("../services/mail.service");

router.get("/send-mail", async (req, res) => {
  const { to, subject, text } = req.query;
  const dataSend = {
    to: "kienvu.dev@gmail.com",
    subject: "Test send mail",
    text: "hello",
  };
  const result = await mailService.sendMail(dataSend);
  res.json(result);
});

module.exports = router;
