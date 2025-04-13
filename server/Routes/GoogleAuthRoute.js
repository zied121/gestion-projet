const express = require('express');
const { oauth2Client, SCOPES } = require('../config/googleAuth');
const router = express.Router();

router.get('/login', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  res.redirect(url);
});

router.get('/callback', async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  res.send('Google authentication successful. You can now create meetings!');
});

module.exports = router;
