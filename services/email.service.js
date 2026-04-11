import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export const sendCandidatePasswordEmail = async (to, fullName, password) => {
  try {
    console.log("Sending email to:", to);

    const info = await transporter.sendMail({
      from: process.env.MAIL_USER,
      to,
      subject: "Your candidate account has been created",
      html: `
        <h2>Hello ${fullName}</h2>
        <p>Your candidate account has been created successfully.</p>
        <p><strong>Temporary password:</strong> ${password}</p>
        <p>Please log in and change your password as soon as possible.</p>
      `,
    });

    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("EMAIL ERROR =>", error);
    throw error;
  }
};