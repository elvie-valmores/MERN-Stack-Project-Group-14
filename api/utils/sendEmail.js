const { Resend } = require("resend");

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is missing from the .env file.");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const { data, error } = await resend.emails.send({
    from:
      process.env.EMAIL_FROM ||
      "Achievement Hub <noreply@send.achievementhub.org>",
    to,
    subject,
    html
  });

  if (error) {
    throw new Error(error.message || "Failed to send email.");
  }

  return data;
};

module.exports = sendEmail;
