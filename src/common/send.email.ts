import nodemailer from 'nodemailer';
import config from '../config';

type EmailOptions = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

const sendEmail = async (emailOptions: EmailOptions) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.mail.user,
      pass: config.mail.pass,
    },
  });

  const mailOptions = {
    from: `${config.mail.from} <${config.mail.user}>`,
    to: emailOptions.to,
    subject: emailOptions.subject,
    text: emailOptions.text,
    html: emailOptions.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email: %s', error);
  }
};

export default sendEmail;
