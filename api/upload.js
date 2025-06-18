// File: /api/upload.js
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { fullName, email, phone, message, anonymous, imageBase64 } = req.body;

    // ✅ Google Apps Script endpoint
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbzT5eSqPA-0Obfr58bGNMQvb8J1kdNg8xmkSeDQq7Y7qO56OsIyCnZfMt7HW1RHb0r8/exec';

    // ✅ Post to Apps Script
    const response = await axios.post(scriptUrl, {
      fullName,
      email,
      phone,
      message,
      anonymous,
      imageBase64
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    res.status(200).json({ result: 'success', sheetResponse: response.data });
  } catch (err) {
    console.error('❌ Upload API error:', err.message);
    res.status(500).json({ result: 'error', message: err.message });
  }
}
