"use strict";
/**
 * Mock Mailer Utility
 * In a real-world app, this would use Nodemailer or a service like Resend.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = void 0;
const sendVerificationEmail = async (email, code) => {
    console.log(`
    --------------------------------------------------
    EMAIL SENT TO: ${email}
    SUBJECT: VaultGuard Email Verification
    BODY: Your 6-digit verification code is: ${code}
    This code will expire in 5 minutes.
    --------------------------------------------------
    `);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
};
exports.sendVerificationEmail = sendVerificationEmail;
