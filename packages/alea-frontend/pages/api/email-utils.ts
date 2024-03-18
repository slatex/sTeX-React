import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL_ID,
    pass: process.env.NODEMAILER_EMAIL_PASSWORD,
  },
});

export async function sendEmail(recepientAddress: string, bodyText: string) {
  const mailOptions = {
    from: process.env.NODE_MAILER_EMAIL_ID,
    to: recepientAddress,
    subject: 'ALeA Password Reset',
    text: bodyText,
  };
  await new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error occurred while sending email:', error);
        reject(error);
      } else {
        resolve(info);
      }
    });
  });
}
