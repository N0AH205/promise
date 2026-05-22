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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { errors, data } = validateDonation(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(', ') });
  }

  const scriptUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  if (!scriptUrl || scriptUrl.includes('YOUR_SCRIPT_ID')) {
    return res.status(503).json({
      success: false,
      message: 'GOOGLE_SHEETS_WEBHOOK_URL is not configured'
    });
  }

  try {
    const forward = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const contentType = forward.headers.get('content-type') || '';
    const result = contentType.includes('application/json')
      ? await forward.json()
      : await forward.text();

    if (!forward.ok) {
      return res.status(502).json({
        success: false,
        message: 'Google Sheets webhook rejected the donation',
        result
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Donation submitted successfully',
      result
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to submit donation',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}
