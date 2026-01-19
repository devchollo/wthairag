# WorkToolsHub — Advanced Web Tools + Multi-Tenant AI RAG Workspace

WorkToolsHub is a production-ready platform offering advanced public tools and a secure, private, multi-tenant AI workspace for RAG (Retrieval-Augmented Generation).

## 🚀 Core Features
- **Public Tools**: DNS Checker, SSL Analyzer, Password Generator, QR Code Generator (No Login Required).
- **AI Reports**: Every tool includes a high-quality AI-generated report.
- **AI RAG Workspace**: Secure, multi-tenant environment for document ingestion and AI chat with citations.
- **Privacy First**: User data is **NEVER** used to train AI models. Temporary files are deleted after 30 mins.
- **Apple-Centric UI**: Minimalist, premium design with glassmorphism and smooth animations.

## 🛠 Tech Stack
- **Frontend**: Next.js 14, TypeScript, CSS Modules (Vanilla CSS).
- **Backend**: Node.js/Express, TypeScript, MongoDB (Atlas Vector Search).
- **Storage**: Backblaze B2 (S3-compatible).
- **AI**: OpenAI GPT-4 / Gemini Pro API.
- **Email**: Brevo.

## ⚙️ Setup Instructions

### Backend
1. `cd backend`
2. `npm install`
3. `cp .env.example .env` (Add your API keys)
4. `npm run dev`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## 📦 Deployment
- **Frontend**: Deploy `frontend/` to **Vercel**.
- **Backend**: Deploy `backend/` to **Render** or **Railway**.
- **Database**: Use **MongoDB Atlas** for managed vector search.

---
Built with ❤️ by Antigravity
