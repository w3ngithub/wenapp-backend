const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

module.exports = async function sendEmail({ email, subject, message }) {
  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME} ${process.env.EMAIL_FROM}`,
    to: Array.isArray(email) ? email.toString() : email,
    subject,
    html: message
  };
  await transport.sendMail(mailOptions);
};
