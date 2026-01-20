# Email Configuration Guide for Brevo

## Overview
The signup email confirmation is not working because the Render environment is missing required Brevo configuration variables.

## Required Environment Variables

On your Render backend service, you need to configure:

### 1. BREVO_API_KEY ✓
**Status:** Already configured  
**Value:** Your Brevo API key

### 2. BREVO_SENDER_EMAIL ❌ 
**Status:** **MISSING - This is why emails aren't sending**  
**Value:** Must be a verified sender email in your Brevo account

### 3. BREVO_SENDER_NAME (Optional)
**Status:** Not required (has default)  
**Value:** Display name for sender (defaults to "WorkToolsHub Security")

## Setup Steps

### Step 1: Verify Sender Email in Brevo

1. Log into [Brevo Dashboard](https://app.brevo.com)
2. Navigate to **Senders & IP** → **Senders**
3. Click **Add a New Sender**
4. Enter sender details:
   - **Email:** e.g., `noreply@worktoolshub.com` or use your domain
   - **Name:** e.g., `WorkToolsHub`
5. **Verify the email** (Brevo will send verification email)
6. Wait for verification to complete

### Step 2: Add Environment Variable to Render

1. Go to your Render dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Click **Add Environment Variable**
5. Add:
   ```
   Key: BREVO_SENDER_EMAIL
   Value: noreply@worktoolshub.com  (use your verified email)
   ```
6. Optionally add:
   ```
   Key: BREVO_SENDER_NAME
   Value: WorkToolsHub
   ```

### Step 3: Deploy

1. Click **Manual Deploy** or push a commit to trigger auto-deploy
2. Wait for deployment to complete

## Testing

After deployment, test the signup flow:

1. Go to your signup page
2. Enter an email address
3. Submit the form
4. Check Render logs for email service output:
   - Should see API call to Brevo
   - Should NOT see the warning: "Brevo API Key not found"
5. Check your inbox for verification email

## Troubleshooting

### Email still not sending?

Check Render logs for errors:
```bash
# Look for lines containing [EmailService]
```

**Common issues:**
- Sender email not verified in Brevo → Verify it
- Incorrect API key → Check BREVO_API_KEY value
- Brevo account issues → Check Brevo dashboard for alerts

### Development Testing

In development mode (local), if `BREVO_API_KEY` is missing, the service will log the email content to console instead of sending:

```
[DEV EMAIL] To: user@example.com | Subject: 123456 is your verification code | Code: <html>
```

This is expected behavior for local development.

## Code Reference

The email service is implemented in:
- [`emailService.ts`](file:///c:/Users/Liam%20Sevillejo/Desktop/sevillejo/wthairag/backend/src/services/emailService.ts#L10-L48) - Email sending logic
- [`authController.ts`](file:///c:/Users/Liam%20Sevillejo/Desktop/sevillejo/wthairag/backend/src/controllers/authController.ts#L17-L48) - Signup flow

**No code changes needed** - the implementation is correct.
