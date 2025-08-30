// Test login endpoint without Vercel auth protection
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Test admin credentials
    const testEmail = 'admin@university.edu';
    const testPassword = 'zyExeKhXoMFtd1Gc';

    if (email === testEmail && password === testPassword) {
      // Generate a simple token (for testing)
      const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        token: token,
        user: {
          email: email,
          role: 'admin'
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
