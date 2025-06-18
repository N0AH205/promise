const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const axios = require('axios'); // ✅ Add axios for forwarding data

const app = express();
const port = process.env.PORT || 3000;

// ✅ CORS & Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static HTML from root
app.use(express.static(__dirname));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// ✅ Serve media folder too
app.use('/media', express.static(path.join(__dirname, 'media')));

// ✅ Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ✅ Serve other .html pages (about-us.html, donate.html, etc.)
app.get('/:page', (req, res) => {
  res.sendFile(path.join(__dirname, req.params.page));
});

// ✅ File upload handling (save into backend/uploads/)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// ✅ POST /donate: handle form + upload + send to Google Apps Script
app.post('/donate', upload.single('proofUpload'), async (req, res) => {
  const { fullName, email, phone, message, anonymous } = req.body;
  const proof = req.file;

  const imageUrl = proof ? `https://promise-community.org/uploads/${proof.filename}` : '';


  console.log('Donation Received:', { fullName, email, phone, message, anonymous });
  console.log('Proof file:', proof?.filename);

  // Build data object to forward to Apps Script
  const donationData = {
    fullName,
    email,
    phone,
    message,
    anonymous: anonymous === 'true',
    imageUrl
  };

  try {
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbzPN9SFQr-Tm4dJPk5CtOOzLLU7urPZvoiSiqgCQZpSLDUG_9Yr9carGUBpj1TSBVq5/exec'; // ✅ Replace with yours

    const response = await axios.post(scriptUrl, donationData, {
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('✅ Data forwarded to Google Sheets:', response.data);
    res.json({ success: true, message: 'Donation received and recorded!', sheetResponse: response.data });

  } catch (err) {
    console.error('❌ Error forwarding to Google Sheets:', err.message);
    res.status(500).json({ success: false, message: 'Error saving to Google Sheets', error: err.message });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
