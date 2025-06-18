const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const uploadthing = require('./backend/uploadthing');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use('/media', express.static(path.join(__dirname, 'media')));

// ✅ Serve HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/:page', (req, res) => {
  res.sendFile(path.join(__dirname, req.params.page));
});

// ✅ New route for forwarding form data after UploadThing
app.post('/donate', async (req, res) => {
  const { fullName, email, phone, message, anonymous, imageUrl } = req.body;

  const donationData = {
    fullName,
    email,
    phone,
    message,
    anonymous: anonymous === 'true',
    imageUrl,
  };

  try {
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbzPN9SFQr-Tm4dJPk5CtOOzLLU7urPZvoiSiqgCQZpSLDUG_9Yr9carGUBpj1TSBVq5/exec';

    const response = await axios.post(scriptUrl, donationData, {
      headers: { 'Content-Type': 'application/json' }
    });

    res.json({ success: true, message: 'Donation recorded!', sheetResponse: response.data });
  } catch (err) {
    console.error('❌ Google Sheets error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to save donation', error: err.message });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
