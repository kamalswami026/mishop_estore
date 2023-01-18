import nodemailer from "nodemailer";
import asyncHandler from "express-async-handler";

export const sendEmail = asyncHandler(async (data, req, res) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_ID,
      pass: process.env.MP,
    },
  });

  let info = await transporter.sendMail({
    from: "kamalswami.026@gmail.com",
    to: data.to,
    subject: data.subject,
    text: data.text,
    html: data.html,
  });

  console.log(`mail sent : ${info.messageId}`);
  console.log("Preview URL ", nodemailer.getTestMessageUrl(info));
});
