const getTransport = () => {
  if (!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)) return null;
  try {
    const nodemailer = require('nodemailer');
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } catch (e) {
    console.warn('nodemailer not available, falling back to console logging');
    return null;
  }
};

const sendEmail = async ({ to, subject, text, html }) => {
  const transport = getTransport();
  const from = process.env.FROM_EMAIL || `no-reply@${process.env.DOMAIN || 'localhost'}`;

  if (!transport) {
    // Fallback to logging for local/dev when SMTP not configured
    console.warn('SMTP not configured. Email details:', { to, subject, text, html });
    return Promise.resolve({ ok: false, info: 'smtp-not-configured' });
  }

  const mailOptions = { from, to, subject, text, html };
  const info = await transport.sendMail(mailOptions);
  return info;
};

module.exports = { sendEmail };
