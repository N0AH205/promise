const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

// ✅ Enable CORS
app.use(cors({ origin: '*' }));

// ✅ Parse incoming data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static files from the parent directory (your frontend lives here)
const rootPath = path.join(__dirname, '..');
app.use(express.static(rootPath));

// ✅ Serve index.html at "/"
app.get('/', (req, res) => {
  res.sendFile(path.join(rootPath, 'index.html'));
});

// ✅ Support direct routes to other .html files (like donate.html)
app.get('/:page', (req, res) => {
  res.sendFile(path.join(rootPath, req.params.page));
});

// ✅ Configure file uploads to 'backend/uploads/'
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// ✅ Handle form + file upload to /donate
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
