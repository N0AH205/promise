const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const helmet = require('helmet');
const morgan = require('morgan');

loadEnvFile(path.join(__dirname, '..', '.env'));
loadEnvFile(path.join(__dirname, '.env'));

const app = express();
const port = process.env.PORT || 3000;
const nodeEnv = process.env.NODE_ENV || 'development';
const maxUploadSize = process.env.MAX_UPLOAD_SIZE || '10mb';
const sheetsWebhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) return;

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^["']|["']$/g, '');

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  });
}

function validateDonation(payload = {}) {
  const {
    amount,
    donationType,
    fullName,
    email,
    phone,
    message,
    anonymous,
    imageBase64
  } = payload;

  const errors = [];
  const isAnonymous = anonymous === true || anonymous === 'true';
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    errors.push('Donation amount is required');
  }

  if (!['one-time', 'monthly'].includes(donationType)) {
    errors.push('Donation type must be one-time or monthly');
  }

  if (!imageBase64 || typeof imageBase64 !== 'string' || !imageBase64.startsWith('data:image/')) {
    errors.push('Valid proof of payment image is required');
  }

  if (!isAnonymous) {
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length === 0) {
      errors.push('Full name is required');
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Valid email is required');
    }

    if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
      errors.push('Phone number is required');
    }
  }

  return {
    errors,
    data: {
      amount: numericAmount,
      donationType,
      fullName: isAnonymous ? 'Anonymous' : fullName.trim(),
      email: isAnonymous ? 'anonymous@donation.local' : email.trim(),
      phone: isAnonymous ? '-' : phone.trim(),
      message: typeof message === 'string' ? message.trim() : '',
      anonymous: isAnonymous,
      imageBase64
    }
  };
}

async function submitDonation(payload) {
  const { errors, data } = validateDonation(payload);

  if (errors.length > 0) {
    const error = new Error(errors.join(', '));
    error.statusCode = 400;
    throw error;
  }

  if (!sheetsWebhookUrl || sheetsWebhookUrl.includes('YOUR_SCRIPT_ID')) {
    const error = new Error('GOOGLE_SHEETS_WEBHOOK_URL is not configured');
    error.statusCode = 503;
    throw error;
  }

  const response = await axios.post(sheetsWebhookUrl, data, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000
  });

  return response.data;
}

async function handleDonationRequest(req, res) {
  try {
    const result = await submitDonation(req.body);
    res.json({
      success: true,
      message: 'Donation submitted successfully',
      result
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;

    if (statusCode >= 500) {
      console.error('Donation submission error:', err.message);
    }

    res.status(statusCode).json({
      success: false,
      message: err.message || 'Failed to save donation',
      error: nodeEnv === 'development' ? err.message : undefined
    });
  }
}

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(morgan(nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: maxUploadSize }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/donate', handleDonationRequest);
app.post('/api/upload', handleDonationRequest);

app.get('/:page', (req, res) => {
  const page = req.params.page || 'index.html';

  if (path.extname(page) !== '.html' && path.extname(page) !== '') {
    return res.status(404).json({ error: 'Not found' });
  }

  const filePath = path.resolve(__dirname, page);
  const backendRoot = path.resolve(__dirname);

  if (!filePath.startsWith(`${backendRoot}${path.sep}`)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(err.statusCode || 404).json({ error: 'Page not found' });
    }
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, _next) => {
  console.error('Server error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: nodeEnv === 'development' ? err.message : undefined
  });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log('Promise Community server running');
    console.log(`   Environment: ${nodeEnv}`);
    console.log(`   Port: ${port}`);
    console.log(`   URL: http://localhost:${port}`);
  });
}

module.exports = app;
