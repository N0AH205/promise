# Architecture

Promise Community is a small static-site plus API project. The public pages are plain HTML served by Express, while donation submissions are validated by the backend and forwarded to a Google Apps Script webhook.

## Components

| Component | Responsibility |
| --- | --- |
| Static HTML pages | Public website content and donation UI |
| Express server | Serves pages, applies middleware, validates donation payloads |
| `/donate` route | Main donation submission endpoint |
| `/api/upload` route | Compatibility endpoint used by the frontend and Vercel |
| Google Apps Script | Receives validated donation data and stores it in Google Sheets |

## Runtime Flow

```text
Browser
  |
  | GET /
  v
Express static pages

Browser donation form
  |
  | POST /api/upload
  v
Express validation
  |
  | POST GOOGLE_SHEETS_WEBHOOK_URL
  v
Google Apps Script / Google Sheets
```

## Design Decisions

- Static HTML keeps the project easy to host and maintain.
- Tailwind CDN avoids a build step for a small volunteer website.
- Express provides local development, static file serving, security middleware, and API validation.
- The serverless `api/upload.js` file keeps the donation API deployable on Vercel.
- Google Sheets is a practical lightweight data store for a nonprofit donation log.

## Security Notes

- Donation submissions are validated on both client and server.
- Proof-of-payment uploads are accepted as image data URLs only.
- The webhook URL is read from environment variables and should not be committed with a real secret.
- Helmet and CORS are configured in `backend/server.js`.
- Production deployments should set `CORS_ORIGIN` to the real site origin instead of `*`.
