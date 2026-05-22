# Promise Community API

## Base URL

| Environment | URL |
| --- | --- |
| Development | `http://localhost:3000` |
| Production | `https://your-domain.com` |

## Donation Submission

### `POST /donate`

Submits a donation record and forwards it to the configured Google Sheets webhook.

### `POST /api/upload`

Same behavior as `/donate`. This route is used by the donation form and mirrors the Vercel serverless endpoint.

### Request Body

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `amount` | number | Yes | Donation amount in Indonesian rupiah |
| `donationType` | string | Yes | `one-time` or `monthly` |
| `fullName` | string | Yes* | Donor name |
| `email` | string | Yes* | Donor email |
| `phone` | string | Yes* | Donor phone number |
| `message` | string | No | Optional donor message |
| `anonymous` | boolean | No | Set to `true` to hide donor identity |
| `imageBase64` | string | Yes | Data URL for proof-of-payment image |

`fullName`, `email`, and `phone` are required unless `anonymous` is `true`.

### Example Request

```json
{
  "amount": 100000,
  "donationType": "one-time",
  "fullName": "Jane Donor",
  "email": "jane@example.com",
  "phone": "+628123456789",
  "message": "For learning materials",
  "anonymous": false,
  "imageBase64": "data:image/png;base64,iVBORw0KGgo..."
}
```

### Success Response

```json
{
  "success": true,
  "message": "Donation submitted successfully",
  "result": {}
}
```

### Validation Error

```json
{
  "success": false,
  "message": "Valid email is required"
}
```

### Missing Webhook Configuration

```json
{
  "success": false,
  "message": "GOOGLE_SHEETS_WEBHOOK_URL is not configured"
}
```

## Static Pages

| Route | Page |
| --- | --- |
| `GET /` | Home |
| `GET /about-us.html` | About |
| `GET /our-team.html` | Team |
| `GET /donate.html` | Donate |
| `GET /news-resources.html` | News and resources |
| `GET /news-detail-1.html` | Art and craft detail |
| `GET /news-detail-2.html` | Stay healthy detail |
