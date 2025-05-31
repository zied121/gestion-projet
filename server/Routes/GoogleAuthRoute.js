const express = require('express');
const router = express.Router();
const { oauth2Client, SCOPES } = require('../config/googleAuth');
const {User} = require('../models/Usermodel');
const isAuth = require('../middleware/isAuth'); // your JWT middleware

router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

router.get('/login', isAuth, (req, res) => {
  const userId = req.user.id; // ✅ from middleware

  const state = JSON.stringify({ userId });
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
    state,
  });

  res.send(url); // ✅ send back redirect URL to frontend
});
// STEP 2: Google callback
router.get('/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    const { userId } = JSON.parse(state);
    console.log('Received userId:', userId);
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    await User.findByIdAndUpdate(userId, {
      google: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
      },
    });

    res.redirect('http://localhost:4200/chat');
  } catch (err) {
    console.error('OAuth callback error:', err);
    res.redirect('http://localhost:4200?auth=error');
  }
});

module.exports = router;
