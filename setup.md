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