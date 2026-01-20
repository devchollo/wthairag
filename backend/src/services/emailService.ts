import axios from 'axios';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export const sendEmail = async ({ to, subject, html, text }: EmailOptions) => {
    try {
        const apiKey = process.env.BREVO_API_KEY;
        const senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@worktoolshub.com';
        const senderName = process.env.BREVO_SENDER_NAME || 'WorkToolsHub Security';

        if (!apiKey) {
            console.warn('[EmailService] Start Brevo API Key not found. Email not sent.');
            // For development, log the content
            if (process.env.NODE_ENV !== 'production') {
                console.log(`[DEV EMAIL] To: ${to} | Subject: ${subject} | Code: ${html}`);
            }
            return false;
        }

        const response = await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            {
                sender: { name: senderName, email: senderEmail },
                to: [{ email: to }],
                subject: subject,
                htmlContent: html,
                textContent: text || html.replace(/<[^>]*>?/gm, ''),
            },
            {
                headers: {
                    'accept': 'application/json',
                    'api-key': apiKey,
                    'content-type': 'application/json',
                },
            }
        );

        return true;
    } catch (error: any) {
        console.error('[EmailService] Failed to send email:', error.response?.data || error.message);
        return false;
    }
};

export const sendVerificationEmail = async (email: string, code: string) => {
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

    return sendEmail({ to: email, subject, html });
};
