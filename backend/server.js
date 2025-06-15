const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// ✅ CORS & Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static HTML + mediahi from root 
app.use(express.static(__dirname));

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

app.post('/donate', upload.single('proofUpload'), (req, res) => {
  const { fullName, email, phone, message, anonymous } = req.body;
  const proof = req.file;

  console.log('Donation Received:', { fullName, email, phone, message, anonymous });
  console.log('Proof file:', proof?.filename);

  res.json({ success: true, message: "Donation data received!" });
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
