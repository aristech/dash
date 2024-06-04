
import { transporter } from "./nodemailerConfig";


export const sendEmail = (email,cc, subject, message, fileName, file, includeFile) => {
    console.log({email})
    const mail = {
        from: 'noreply@progressnet.dev',
        to: email,
        cc: cc,
        subject: subject,
        text: message,
        attachments: [{
            filename: `${fileName}.xlsx`,
            content: file
        }],
    
    };
    

    return new Promise((resolve, reject) => {
      transporter.sendMail(mail, (err, info) => {
          if (err) {
              console.log("error " + err.message);
              resolve({
                  status: false,
                  message: err.message
              }); // Resolve with an object containing status false and the error message
          } else {
              console.log('Email sent successfully!');
              resolve({
                  status: true,
                  message: 'Email sent successfully'
              }); // Resolve with an object containing status true and a success message
          }
        
      });
  });
  }
