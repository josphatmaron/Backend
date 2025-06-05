const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY); // Set this in your .env file

async function sendVerificationEmail(to, code) {
  const msg = {
    to,
    from: 'your@email.com', // <-- Replace with your verified sender email from SendGrid!
    subject: 'Verify your account',
    text: `Your verification code is: ${code}`,
    html: `<p>Your verification code is: <strong>${code}</strong></p>`
  };
  await sgMail.send(msg);
}

module.exports = { sendVerificationEmail };