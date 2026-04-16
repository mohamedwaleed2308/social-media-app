import nodemailer from 'nodemailer'

export const sendEmail = async ({
    to=[],
    cc=[],
    bcc=[],
    text='hello',
    html=``,
    subject='hello',
    attachments=[]
}={}) => {

    const transporter = nodemailer.createTransport({
        service:'gmail',
        auth: {
            user: process.env.email,
            pass: process.env.email_password,
        },
    });
    
    // async..await is not allowed in global scope, must use a wrapper
        // send mail with defined transport object
        const info = await transporter.sendMail({
            from: `"Social Media App" <${process.env.email}>`, // sender address
            to,
            cc,
            bcc, 
            subject, 
            text,
            html,
            attachments
        });

        console.log("Message sent: %s", info.messageId);
        // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>


}