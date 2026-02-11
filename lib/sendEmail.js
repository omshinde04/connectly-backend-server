import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export async function sendResetEmail(to, resetToken) {
    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

    const mailOptions = {
        from: `"Connectly Support" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Reset your Connectly password',
        html: `
            <div style="font-family: Arial, sans-serif;">
                <h2>Password Reset Request</h2>
                <p>You requested to reset your password.</p>
                <p>Click the link below to continue:</p>
                <a href="${resetLink}" 
                   style="display:inline-block;padding:10px 20px;
                          background:#0df259;color:#000;
                          text-decoration:none;border-radius:5px;">
                   Reset Password
                </a>
                <p style="margin-top:20px;font-size:12px;color:#666;">
                    This link expires in 15 minutes.
                </p>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
}
