[README.md](https://github.com/user-attachments/files/26168079/README.md)
# Helios ☀️

Personal AI assistant powered by Kimi K2.5 (NVIDIA NIM) with Groq fallback.

## Features
- 🤖 Kimi K2.5 primary model (vision capable)
- ⚡ Groq llama-3.3-70b fallback
- 🖼️ Image attachment support
- 🔐 Google OAuth login
- 💬 Chat history (localStorage)
- 🍎 Apple-inspired UI

---

## Step 1 — Get your API keys

### NVIDIA NIM (Kimi K2.5)
1. Go to https://build.nvidia.com
2. Click your profile → API Keys → Generate
3. Copy the key (starts with `nvapi-`)

### Groq (fallback)
1. Go to https://console.groq.com
2. API Keys → Create API Key
3. Copy the key

---

## Step 2 — Set up Google OAuth

1. Go to https://console.cloud.google.com
2. Create a new project (or use existing)
3. Go to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Name: `Helios`
7. Under **Authorized JavaScript origins**, add:
   - `http://localhost:3000` (for local dev)
   - `https://your-vercel-app.vercel.app` (after deploy)
8. Click **Create** → copy the **Client ID**
9. Open `index.html` and replace:
   ```
   const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
   ```
   with your actual Client ID.

---

## Step 3 — Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from the helios folder
vercel

# Set environment variables
vercel env add NVIDIA_API_KEY
vercel env add GROQ_API_KEY

# Redeploy with env vars
vercel --prod
```

Or via Vercel Dashboard:
1. Push this folder to a new GitHub repo
2. Go to https://vercel.com → Import project
3. Set environment variables:
   - `NVIDIA_API_KEY` = your NVIDIA NIM key
   - `GROQ_API_KEY` = your Groq key
4. Deploy

---

## Project Structure

```
helios/
├── api/
│   └── chat.js       ← Vercel serverless function (backend proxy)
├── index.html        ← Frontend (single file)
├── vercel.json       ← Routing config
├── package.json
└── README.md
```

---

## Local Development

```bash
npm install -g vercel
vercel dev
```

Then open http://localhost:3000
