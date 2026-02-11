# WorkToolsHub

WorkToolsHub is an open-source web platform that combines practical everyday web utilities (like DNS, SSL, password, and QR tools) with a private AI-powered workspace for document Q&A.

It is designed for teams and individuals who want:
- Fast public tools that work without account signup
- AI-assisted reporting for technical checks
- A secure, multi-tenant RAG workspace with citations
- A modern, clean UI focused on usability

## Features

### Public tools
- DNS Checker
- SSL Analyzer
- Password Generator
- QR Code Generator

### AI capabilities
- AI-generated reports for tool outputs
- Document ingestion and AI chat with citations
- Multi-tenant workspace isolation

### Privacy and product principles
- User data is not used for model training
- Temporary files are automatically cleaned up
- Minimal, Apple-inspired interface with smooth interactions

## Tech Stack
- **Frontend:** Next.js 14, TypeScript, CSS Modules
- **Backend:** Node.js, Express, TypeScript
- **Database:** MongoDB Atlas (including vector search)
- **Storage:** Backblaze B2 (S3-compatible)
- **AI Providers:** OpenAI / Gemini
- **Email:** Brevo

## Getting Started (Local Development)

### 1) Clone the repository
```bash
git clone https://github.com/devchollo/wthairag.git
cd wthairag
```

### 2) Backend setup
```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` and provide all required values (API keys, DB connection string, storage credentials, etc.).

Start backend:
```bash
npm run dev
```

### 3) Frontend setup
Open a new terminal:
```bash
cd frontend
npm install
cp .env.example .env.local 2>/dev/null || true
```

If `frontend/.env.example` exists, copy it and fill in required values. If not, create `frontend/.env.local` and add the frontend environment variables needed to reach your backend and any client-side integrations.

Start frontend:
```bash
npm run dev
```

## Environment Variables Guide

This project uses environment files for local development.

- **Backend env file:** `backend/.env`
- **Frontend env file:** `frontend/.env.local`

### Recommended setup flow
1. Start from each `.env.example` file when available.
2. Never commit real secrets.
3. Use different credentials for local, staging, and production.
4. Rotate keys immediately if exposed.

### Typical variables you will configure

Backend examples:
- Database URI (MongoDB)
- JWT/auth secrets
- OpenAI or Gemini API key
- Backblaze B2 / S3 credentials
- Email provider credentials (Brevo)
- CORS / frontend origin settings

Frontend examples:
- Backend API base URL
- Public feature flags (if any)
- Any `NEXT_PUBLIC_*` values required by the app

> Important: Keep all secret values server-side whenever possible.

## Contributing

Contributions are welcome and appreciated.

### Ways to contribute
- Report bugs
- Propose or build new features
- Improve docs and developer experience
- Refactor and improve performance

### Contribution process
1. Fork the repository
2. Create a branch from `main`:
   ```bash
   git checkout -b feat/short-description
   ```
3. Make your changes with clear commits
4. Run relevant checks/tests locally
5. Open a pull request with:
   - What changed
   - Why it changed
   - Screenshots (for UI changes)
   - Any migration or env updates required

### Pull request guide
- Keep PRs focused and small when possible
- Follow existing code style and project structure
- Update docs for behavioral/config changes
- Add or update tests where practical
- Be respectful and constructive during review

## Deployment (High-level)
- **Frontend:** Vercel
- **Backend:** Render or Railway
- **Database:** MongoDB Atlas

## License


