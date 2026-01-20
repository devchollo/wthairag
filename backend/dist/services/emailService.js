"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendInviteEmail = exports.sendVerificationEmail = exports.sendEmail = void 0;
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
const sendVerificationEmail = async (email, code) => {
    const subject = `${code} is your WorkToolsHub verification code`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #000; letter-spacing: -1px;">Verify your email</h2>
            <p style="color: #555; line-height: 1.6;">
                Welcome to WorkToolsHub. Use the code below to complete your signup and initialize your workspace.
            </p>
            <div style="background: #f4f4f5; padding: 20px; text-align: center; border-radius: 8px; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2563eb;">${code}</span>
            </div>
            <p style="color: #888; font-size: 12px; margin-top: 30px;">
                This code will expire in 10 minutes. If you did not request this, please ignore this email.
            </p>
        </div>
    `;
    return (0, exports.sendEmail)({ to: email, subject, html });
};
exports.sendVerificationEmail = sendVerificationEmail;
const sendInviteEmail = async (email, inviterName, workspaceName, inviteLink) => {
    const subject = `You are invited to join ${workspaceName} on WorkToolsHub`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #000; letter-spacing: -1px;">Join your workspace</h2>
            <p style="color: #555; line-height: 1.6;">
                <strong>${inviterName}</strong> has invited you to collaborate on the <strong>${workspaceName}</strong> workspace.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteLink}" style="background: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">Accept Invitation</a>
            </div>
            <p style="color: #888; font-size: 12px;">
                This link will expire in 48 hours. If you did not expect this invitation, you can safely ignore this email.
            </p>
        </div>
    `;
    return (0, exports.sendEmail)({ to: email, subject, html });
};
exports.sendInviteEmail = sendInviteEmail;
