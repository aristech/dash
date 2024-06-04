
import nodemailer from 'nodemailer';
const transporter = nodemailer.createTransport({
    host: process.env.NODEMAILER_HOST,
    port: process.env.NODEMAILER_PORT,
    secure: false, // true for TLS, false for STARTTLS
    auth: {
      user:  process.env.NODEMAILER_USER,
      pass:  process.env.NODEMAILER_PASS,
    },
  });



  

export {transporter}