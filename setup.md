# WorkToolsHub Setup & Deployment Guide

This guide outlines the environment variables and platform settings required for deploying WorkToolsHub.

## 🚄 Render (Backend)
**Crucial**: Set the **Root Directory** to `backend`.

- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### Environment Variables
| Variable | Example |
| :--- | :--- |
| `MONGO_URI` | `mongodb+srv://...` |
| `JWT_SECRET` | `your-secure-secret` |
| `FRONTEND_URL` | `https://worktoolshub.vercel.app` |
| `B2_ENDPOINT` | `https://s3.us-east-005.backblazeb2.com` |
| `B2_REGION` | `us-east-005` |
| `B2_ACCESS_KEY_ID` | `0055...` |
| `B2_SECRET_ACCESS_KEY` | `K005...` |
| `B2_BUCKET` | `worktoolshub-storage` |
| `OPENAI_API_KEY` | `sk-proj-...` |
| `BREVO_API_KEY` | `xkeysib-...` |

---

## 📐 Vercel (Frontend)
**Crucial**: Set the **Root Directory** to `frontend`.

- **Framework Preset**: `Next.js`
- **Build Command**: `next build` (Automatic)

### Environment Variables
| Variable | Example |
| :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://your-backend.onrender.com` |

---

### ❓ Troubleshooting the 404 Error
If you see a 404 after deployment:
1. **Wrong Root Directory**: This is a monorepo. You MUST tell Vercel/Render that the apps are in the `frontend` and `backend` folders respectively.
2. **Missing Build Scripts**: ensure the backend has `"build": "tsc"` and `"start": "node dist/server.js"` in its `package.json` (I have just added these for you).
3. **Environment Variables**: Ensure `NEXT_PUBLIC_API_URL` is set on Vercel, or the frontend won't know where to send requests.
