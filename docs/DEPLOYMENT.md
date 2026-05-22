# Deployment Guide

## Local Development

```bash
git clone https://github.com/N0AH205/promise.git
cd promise
npm run install:backend
copy .env.example .env
npm start
```

Use `cp .env.example .env` on macOS/Linux.

Open `http://localhost:3000`.

## Required Environment Variables

| Variable | Description | Example |
| --- | --- | --- |
| `PORT` | Local server port | `3000` |
| `NODE_ENV` | Runtime environment | `production` |
| `CORS_ORIGIN` | Allowed browser origin | `https://your-domain.com` |
| `GOOGLE_SHEETS_WEBHOOK_URL` | Google Apps Script deployment URL | `https://script.google.com/macros/s/.../exec` |
| `MAX_UPLOAD_SIZE` | JSON body size limit | `10mb` |

## Vercel

1. Import the GitHub repository in Vercel.
2. Set the project root directory to `backend`.
3. Add `GOOGLE_SHEETS_WEBHOOK_URL` in Vercel environment variables.
4. Deploy.

The serverless function is `backend/api/upload.js`. Static HTML files are served from the `backend` directory.

## Render or Railway

Use these settings:

| Setting | Value |
| --- | --- |
| Build command | `cd backend && npm ci` |
| Start command | `cd backend && npm start` |
| Node version | `18` or newer |

Add the environment variables listed above in the hosting dashboard.

## VPS / Cloud VM

```bash
git clone https://github.com/N0AH205/promise.git
cd promise/backend
npm ci --omit=dev
npm install -g pm2
pm2 start server.js --name promise-community
pm2 save
pm2 startup
```

Put a reverse proxy such as Nginx or Caddy in front of the Node process for HTTPS.

## Smoke Test

After deployment:

```bash
curl https://your-domain.com/
curl -X POST https://your-domain.com/api/upload \
  -H "Content-Type: application/json" \
  -d '{"amount":100000,"donationType":"one-time","anonymous":true,"imageBase64":"data:image/png;base64,test"}'
```

The POST request should return success when the webhook is configured correctly. If the webhook is missing, it should return `503` with a configuration message.
