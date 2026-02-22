import nodemailer from 'nodemailer';

/**
 * Mailer Utility powered by Nodemailer.
 * Configure SMTP settings in your .env file.
 */

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendVerificationEmail = async (toEmail: string, code: string) => {
    // Validate recipient early to catch any upstream logic bugs
    if (!toEmail || !toEmail.includes('@')) {
        console.error(`[MAILER] Invalid recipient email provided: "${toEmail}" — aborting.`);
        return { success: false, error: 'Invalid recipient email' };
    }

    const senderAddress = process.env.SMTP_USER || 'noreply@vaultguard.io';
    console.log(`[MAILER] Sending MFA code → To: ${toEmail} | From: ${senderAddress}`);

    const mailOptions = {
        from: `"VaultGuard Security" <${senderAddress}>`,
        to: toEmail,
        subject: 'VaultGuard — Your Security Code',
        text: `Your VaultGuard verification code is: ${code}. It expires in 5 minutes.`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #333; text-align: center;">VaultGuard Security</h2>
                <p>Hello,</p>
                <p>You are receiving this email because a login was initiated for: <strong>${toEmail}</strong></p>
                <div style="background: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #000;">${code}</span>
                </div>
                <p style="color: #666; font-size: 14px;">This code will expire in <b>5 minutes</b>. If you did not request this, please secure your account immediately.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="color: #999; font-size: 12px; text-align: center;">&copy; 2026 VaultGuard. All rights reserved.</p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`[MAILER] ✅ Email sent successfully to ${toEmail} (Message ID: ${info.messageId})`);
        return { success: true };
    } catch (error) {
        console.error(`[MAILER] ❌ Failed to send to ${toEmail}:`, error);
        if (process.env.NODE_ENV === 'development') {
            console.log(`[DEV FALLBACK] Verification code for ${toEmail}: ${code}`);
        }
        return { success: false, error };
    }
};
