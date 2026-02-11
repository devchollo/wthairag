import axios from 'axios';

interface EmailOptions {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    cc?: string[];
    bcc?: string[];
    attachments?: { name: string; content: string }[];
}

export const sendEmail = async ({ to, subject, html, text, cc = [], bcc = [], attachments = [] }: EmailOptions) => {
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

        const payload: Record<string, unknown> = {
            sender: { name: senderName, email: senderEmail },
            to: (Array.isArray(to) ? to : [to]).map((email) => ({ email })),
            subject: subject,
            htmlContent: html,
            textContent: text || html.replace(/<[^>]*>?/gm, ''),
        };

        if (cc.length > 0) {
            payload.cc = cc.map((email) => ({ email }));
        }

        if (bcc.length > 0) {
            payload.bcc = bcc.map((email) => ({ email }));
        }

        if (attachments.length > 0) {
            payload.attachment = attachments;
        }

        const response = await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            payload,
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

const logoUrl = 'https://ksevillejo.s3.us-east-005.backblazeb2.com/WorkToolsHub+Logo.png';

const getLogoSection = async () => `
    <div style="text-align: center; margin-bottom: 24px;">
        <img src="${logoUrl}" alt="WorkToolsHub" width="160" style="display: inline-block; max-width: 100%; height: auto;" />
    </div>
`;

export const sendVerificationEmail = async (email: string, code: string) => {
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

    return sendEmail({ to: email, subject, html });
};

interface FormSubmissionEmailOptions {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    appName: string;
    appLogoUrl?: string;
    submitterLabel: string;
    submittedAtIso: string;
    renderedHtmlBody: string;
    renderedTextBody: string;
    attachments?: { name: string; content: string }[];
}

export const sendFormSubmissionEmail = async ({
    to,
    cc = [],
    bcc = [],
    subject,
    appName,
    appLogoUrl,
    submitterLabel,
    submittedAtIso,
    renderedHtmlBody,
    renderedTextBody,
    attachments = [],
}: FormSubmissionEmailOptions) => {
    const normalizedAppLogoUrl = appLogoUrl?.trim();
    const headerLogo = normalizedAppLogoUrl
        ? `
            <div style="text-align: center; margin-bottom: 20px;">
                <img src="${normalizedAppLogoUrl}" alt="${appName} logo" style="max-width: 220px; max-height: 120px; width: auto; height: auto;" />
            </div>
        `
        : '';

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 760px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
            ${headerLogo}
            <h2 style="color: #111827; letter-spacing: -0.3px; margin: 0 0 8px;">${appName} - New Form Submission</h2>
            <p style="color: #4b5563; margin: 0 0 4px;"><strong>Submitted By:</strong> ${submitterLabel}</p>
            <p style="color: #4b5563; margin: 0 0 18px;"><strong>Submitted At:</strong> ${submittedAtIso}</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0 20px;" />
            ${renderedHtmlBody}
        </div>
    `;

    const text = `${appName} - New Form Submission\nSubmitted By: ${submitterLabel}\nSubmitted At: ${submittedAtIso}\n\n${renderedTextBody}`;

    return sendEmail({
        to,
        cc,
        bcc,
        subject,
        html,
        text,
        attachments,
    });
};
export const sendInviteEmail = async (email: string, inviterName: string, workspaceName: string, inviteLink: string) => {
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

    return sendEmail({ to: email, subject, html });
};

export const sendResetPasswordEmail = async (email: string, resetLink: string) => {
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

    return sendEmail({ to: email, subject, html });
};
