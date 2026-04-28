import nodemailer from "nodemailer";

async function sendEmail(receiverEmail, subject, messageBody) {
    // Configure transporter (assumes environment variables are set for safety)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: "smtp.gmail.com",
        port: 587,
        auth: {
            user: 'wintricelms@gmail.com',
            pass: process.env.EMAIL_PASS
        }
    });

    // Create a simple dodgerblue and white HTML template
    const htmlContent = `
        <div style="background:#1e90ff; padding:24px 0; text-align:center;">
            <div style="background:white; margin:0 auto; max-width:450px; border-radius:8px; padding:32px 30px;">
                <h1 style="color:#1e90ff; margin-top:0; margin-bottom:16px; font-family:sans-serif;">Wintrice</h1>
                <h2 style="color:#222; margin-top:0; margin-bottom:16px; font-family:sans-serif;">${subject}</h2>
                <div style="color:#444; font-family:sans-serif; font-size:16px;">${messageBody}</div>
            </div>
        </div>
    `;

    try {
        // Send the email
        await transporter.sendMail({
            from: 'WinTrice Finance <wintricelms@gmial.com>',
            to: receiverEmail,
            subject: subject,
            html: htmlContent
        });
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send email");
    }

}


export default sendEmail