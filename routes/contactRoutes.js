const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
require("dotenv").config();

router.post("/", async (req, res) => {
 const { name, email, message } = req.body;

 try {
const transporter = nodemailer.createTransport({
service: "gmail",
auth: {
user: process.env.EMAIL_USER,
pass: process.env.EMAIL_PASS,
},
 });

 await transporter.sendMail({
 from: process.env.EMAIL_USER,
to: process.env.EMAIL_USER,
subject: `New Contact Form from ${name}`,
 text: `Email: ${email}\n\n${message}`,
 });

 res.status(200).json({ message: "Message sent successfully" });
 } catch (err) {
 console.error("Email send error:", err.message);
 res.status(500).json({ message: "Failed to send message" });
}
});

module.exports = router;
