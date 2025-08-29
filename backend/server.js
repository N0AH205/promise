const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/:page', (req, res) => {
  res.sendFile(path.join(__dirname, req.params.page));
});

app.post('/donate', async (req, res) => {
  const { fullName, email, phone, message, anonymous, imageBase64 } = req.body;

  try {
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbzT5eSqPA-0Obfr58bGNMQvb8J1kdNg8xmkSeDQq7Y7qO56OsIyCnZfMt7HW1RHb0r8/exec';

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

    res.json({ success: true, message: 'Donation recorded!', result: response.data });
  } catch (err) {
    console.error('❌ Google Sheets error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to save donation', error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
