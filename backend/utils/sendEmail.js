const nodemailer = require("nodemailer");

 
const createTransporter = async () => {
  
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

   
  const testAccount = await nodemailer.createTestAccount();
  console.log("Using Ethereal test email:", testAccount.user);

  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

/**
 * Send an email
 * @param {Object} options - { to, subject, html }
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = await createTransporter();

    const info = await transporter.sendMail({
      from: `"SmartStay" <${process.env.EMAIL_FROM || "noreply@smartstay.com"}>`,
      to,
      subject,
      html,
    });

   
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log("Preview email at:", previewUrl);
    }

    return info;
  } catch (error) {
    console.error(" Email send failed:", error.message);
    throw new Error("Email could not be sent");
  }
};

module.exports = sendEmail;
