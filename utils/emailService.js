const nodemailer = require('nodemailer');
require('dotenv').config();

// Konfigurasi transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Kirim email reset password
exports.sendPasswordResetEmail = async (email, resetUrl) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reset Password - Taskfocus',
    html: `
      <h1>Reset Password</h1>
      <p>Anda menerima email ini karena Anda (atau seseorang) telah meminta reset password untuk akun Anda.</p>
      <p>Silakan klik link berikut atau salin ke browser Anda untuk menyelesaikan proses:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>Jika Anda tidak meminta reset password, abaikan email ini dan password Anda akan tetap tidak berubah.</p>
      <p>Link ini akan kedaluwarsa dalam 1 jam.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};