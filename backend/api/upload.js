export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { fullName, email, phone, message, anonymous, imageBase64 } = req.body;

  
    console.log("🧪 Received fullName:", fullName);
    console.log("🧪 Received imageBase64 preview:", imageBase64?.substring(0, 100));

    if (!imageBase64 || !imageBase64.startsWith("data:image/")) {
      return res.status(400).json({
        success: false,
        message: '❌ Invalid or missing imageBase64',
      });
    }

    const scriptUrl = 'https://script.google.com/macros/s/AKfycbzT5eSqPA-0Obfr58bGNMQvb8J1kdNg8xmkSeDQq7Y7qO56OsIyCnZfMt7HW1RHb0r8/exec';

    const forward = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName,
        email,
        phone,
        message,
        anonymous,
        imageBase64,
      })
    });

    const result = await forward.json();

    return res.status(200).json({
      success: true,
      message: '✅ Donation submitted!',
      result
    });

  } catch (err) {
    console.error("❌ Error submitting donation:", err);
    return res.status(500).json({
      success: false,
      message: '❌ Server error',
      error: err.message
    });
  }
}
