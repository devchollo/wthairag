"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResetPasswordEmail = exports.sendInviteEmail = exports.sendVerificationEmail = exports.sendEmail = void 0;
const axios_1 = __importDefault(require("axios"));
const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const apiKey = process.env.BREVO_API_KEY;
        const senderEmail = process.env.BREVO_SENDER_EMAIL || 'devchollo@gmail.com';
        const senderName = process.env.BREVO_SENDER_NAME || 'WorkToolsHub.';
        if (!apiKey) {
            console.warn('[EmailService] Start Brevo API Key not found. Email not sent.');
            // For development, log the content
            if (process.env.NODE_ENV !== 'production') {
                console.log(`[DEV EMAIL] To: ${to} | Subject: ${subject} | Code: ${html}`);
            }
            return false;
        }
        const response = await axios_1.default.post('https://api.brevo.com/v3/smtp/email', {
            sender: { name: senderName, email: senderEmail },
            to: [{ email: to }],
            subject: subject,
            htmlContent: html,
            textContent: text || html.replace(/<[^>]*>?/gm, ''),
        }, {
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json',
            },
        });
        return true;
    }
    catch (error) {
        console.error('[EmailService] Failed to send email:', error.response?.data || error.message);
        return false;
    }
};
exports.sendEmail = sendEmail;
const logoUrl = 'https://ksevillejo.s3.us-east-005.backblazeb2.com/WorkToolsHub+Logo.png';
const getLogoSection = async () => `
    <div style="text-align: center; margin-bottom: 24px;">
        <img src="${logoUrl}" alt="WorkToolsHub" width="160" style="display: inline-block; max-width: 100%; height: auto;" />
    </div>
`;
const sendVerificationEmail = async (email, code) => {
    const subject = `Your WorkToolsHub verification code: ${code}`;
    const logoSection = await getLogoSection();
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
            ${logoSection}
            <h2 style="color: #111827; letter-spacing: -0.5px; margin: 0 0 12px;">Verify your email address</h2>
            <p style="color: #555; line-height: 1.6;">
                Welcome to WorkToolsHub! Use this 6-digit code to finish creating your account and activate your workspace.
            </p>
            <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 10px; margin: 28px 0;">
                <span style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #2563eb;">${code}</span>
            </div>
            <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">
                This code expires in 10 minutes. If you didn’t request this, you can safely ignore this email.
            </p>
        </div>
    `;
    return (0, exports.sendEmail)({ to: email, subject, html });
};
exports.sendVerificationEmail = sendVerificationEmail;
const sendInviteEmail = async (email, inviterName, workspaceName, inviteLink) => {
    const subject = `You're invited to ${workspaceName} on WorkToolsHub`;
    const logoSection = await getLogoSection();
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
            ${logoSection}
            <h2 style="color: #111827; letter-spacing: -0.5px; margin: 0 0 12px;">You’ve been invited</h2>
            <p style="color: #555; line-height: 1.6;">
                <strong>${inviterName}</strong> invited you to join the <strong>${workspaceName}</strong> workspace on WorkToolsHub.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteLink}" style="background: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">Accept Invitation</a>
            </div>
            <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">
                This invitation link expires in 48 hours. If the button doesn’t work, copy and paste this URL into your browser:
                <br />
                <a href="${inviteLink}" style="color: #2563eb; word-break: break-all;">${inviteLink}</a>
            </p>
            <p style="color: #6b7280; font-size: 12px; margin-top: 16px;">
                If you weren’t expecting this invite, you can safely ignore this email.
            </p>
        </div>
    `;
    return (0, exports.sendEmail)({ to: email, subject, html });
};
exports.sendInviteEmail = sendInviteEmail;
const sendResetPasswordEmail = async (email, resetLink) => {
    const subject = `Reset your WorkToolsHub password`;
    const logoSection = await getLogoSection();
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
            ${logoSection}
            <h2 style="color: #111827; letter-spacing: -0.5px; margin: 0 0 12px;">Reset your password</h2>
            <p style="color: #555; line-height: 1.6;">
                We received a request to reset the password for your WorkToolsHub account. You can set a new password using the button below.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="background: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">Reset Password</a>
            </div>
            <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">
                This link expires in 10 minutes. If you didn’t request a password reset, you can safely ignore this email.
            </p>
            <p style="color: #6b7280; font-size: 12px; margin-top: 16px;">
                Having trouble with the button? Copy and paste this URL into your browser:
                <br />
                <a href="${resetLink}" style="color: #2563eb; word-break: break-all;">${resetLink}</a>
            </p>
        </div>
    `;
    return (0, exports.sendEmail)({ to: email, subject, html });
};
exports.sendResetPasswordEmail = sendResetPasswordEmail;
