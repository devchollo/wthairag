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

## 🛠 Local Development
To prevent Vercel from getting confused by the monorepo structure, the root `package.json` has been removed. Use these commands:

### Running Frontend
```bash
cd frontend && npm install && npm run dev
```

### Running Backend
```bash
cd backend && npm install && npm run dev
```

---

### ❓ Troubleshooting the 404 Error
If you still see a 404 after deployment:
1. **GitHub Sync**: Ensure the deletion of the root `package.json` has been pushed to GitHub.
2. **Vercel Settings**: Deep check **Override Output Directory**. It should be **DISABLED** (Off). Vercel handles the output automatically for Next.js.
3. **Invalid Next Version**: I have corrected the `frontend/package.json` to use `next@15.1.4`. The previous version `16.x` was likely causing the build artifacts to be misrouted.
4. **Clean Redeploy**: Go to Vercel Deployments > [...] > **Redeploy** and ensuring **"Use existing Build Cache"** is checked as **OFF**.
