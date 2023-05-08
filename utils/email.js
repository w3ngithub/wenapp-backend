const nodemailer = require('nodemailer');

class EmailNotification {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async sendEmail({ email, subject, message }) {
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} ${process.env.EMAIL_FROM}`,
      to: Array.isArray(email) ? email.toString() : email,
      // to: 'wenapp.staging@webexpertsnepal.com',
      subject,
      html: message
    };

    await this.transporter.sendMail(mailOptions);
  }
}

module.exports = EmailNotification;
