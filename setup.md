# WorkToolsHub Setup & Deployment Guide

This guide outlines the environment variables required for deploying WorkToolsHub to production.

## 🚄 Render (Backend)
Add these variables in your Render Web Service settings.

| Variable | Description | Example |
| :--- | :--- | :--- |
| `MONGO_URI` | MongoDB Atlas host | `mongodb+srv://...` |
| `JWT_SECRET` | Secure JWT signing key | `your-secure-secret` |
| `FRONTEND_URL` | Your Vercel frontend URL | `https://worktoolshub.vercel.app` |
| `B2_ENDPOINT` | Backblaze B2 S3 endpoint | `https://s3.us-east-005.backblazeb2.com` |
| `B2_REGION` | Backblaze B2 region | `us-east-005` |
| `B2_ACCESS_KEY_ID` | B2 Application Key ID | `0055...` |
| `B2_SECRET_ACCESS_KEY` | B2 Application Key | `K005...` |
| `B2_BUCKET` | B2 Bucket name | `worktoolshub-storage` |
| `OPENAI_API_KEY` | OpenAI API Key | `sk-proj-...` |
| `GEMINI_API_KEY` | Gemini API Key | `AIza...` |
| `BREVO_API_KEY` | Brevo API Key | `xkeysib-...` |

## 📐 Vercel (Frontend)
Add these in your Vercel Project settings.

| Variable | Description | Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Render backend URL | `https://api.onrender.com` |

---

### Local Testing
For local testing, ensure your `.env` files in `/backend` and `/frontend` match the keys above with `http://localhost:[port]` values where applicable.
