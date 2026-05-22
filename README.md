# Promise Community

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.1+-lightgrey.svg)](https://expressjs.com)
[![Deploy on Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)

Promise Community is a nonprofit website for a Jakarta-based youth volunteer community focused on education, mentorship, and well-being for underprivileged children.

The project includes a responsive website, an Express backend, and a donation submission flow that forwards proof-of-payment records to a Google Apps Script webhook.

## Features

- Client-side and server-side validation for donation submissions
- Express routes for static pages and donation APIs
- Vercel-compatible serverless endpoint at `backend/api/upload.js`
- Security and production basics with Helmet, CORS, Morgan logging, environment configuration, and GitHub Actions CI

## Tech Stack

| Area | Tools |
| --- | --- |
| Frontend | HTML, Tailwind CSS CDN, Alpine.js, Font Awesome, Google Fonts |
| Backend | Node.js, Express, Axios, Helmet, CORS, Morgan |
| Integrations | Google Apps Script / Google Sheets webhook |
| Tooling | npm scripts, GitHub Actions |

## Project Structure

```text
promise/
|-- .env.example
|-- .github/workflows/ci.yml
|-- docs/
|   |-- API.md
|   |-- ARCHITECTURE.md
|   `-- DEPLOYMENT.md
|-- backend/
|   |-- server.js
|   |-- api/upload.js
|   |-- index.html
|   |-- about-us.html
|   |-- donate.html
|   |-- our-team.html
|   |-- news-resources.html
|   |-- news-detail-1.html
|   |-- news-detail-2.html
|   `-- media/
|-- package.json
`-- README.md
```

## Quick Start

### Prerequisites

- Node.js 18+
- npm

### Install and Run

```bash
git clone https://github.com/N0AH205/promise.git
cd promise
npm run install:backend
copy .env.example .env
npm start
```

On macOS/Linux, use `cp .env.example .env` instead of `copy .env.example .env`.

The site runs at `http://localhost:3000`.

## Environment Variables

Create `.env` in the repository root:

```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
MAX_UPLOAD_SIZE=10mb
```
## Scripts

Run from the repository root:

| Command | Description |
| --- | --- |
| `npm run install:backend` | Install backend dependencies |
| `npm start` | Start the Express server |
| `npm run dev` | Start the Express server for local development |
| `npm run check` | Check backend JavaScript syntax |
| `npm test` | Run the project checks |

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/` | Home page |
| `GET` | `/:page.html` | Static HTML pages |
| `POST` | `/donate` | Submit donation data |
| `POST` | `/api/upload` | Donation endpoint used by the form and Vercel |

See [docs/API.md](docs/API.md) for request and response examples.

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for VPS, Render/Railway, and Vercel deployment notes.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## License

This project is licensed under the ISC License.
