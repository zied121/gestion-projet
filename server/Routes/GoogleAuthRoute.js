// Add these to your existing googleAuthRoute.js file

const express = require('express');
const { oauth2Client, SCOPES } = require('../config/googleAuth');
const router = express.Router();

// Add CORS middleware
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// ADD THIS NEW ENDPOINT - Check authentication status
router.get('/auth-status', (req, res) => {
  try {
    const isAuthenticated = oauth2Client.credentials && 
                           oauth2Client.credentials.access_token &&
                           oauth2Client.credentials.expiry_date > Date.now();
    
    res.json({ isAuthenticated });
  } catch (error) {
    console.error('Error checking auth status:', error);
    res.json({ isAuthenticated: false });
  }
});

// Your existing login route (keep as is)
router.get('/login', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  res.redirect(url);
});

// UPDATE YOUR EXISTING CALLBACK to redirect to Angular/*
/*router.get('/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.redirect('http://localhost:4200?auth=error');
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    console.log('Google authentication successful');
    // Parse the state parameter to get roomId
    let redirectUrl = 'http://localhost:4200?auth=success';
    
    if (state) {
      try {
        const stateData = JSON.parse(state);
        if (stateData.roomId) {
          // Redirect to the specific room
          redirectUrl = `http://localhost:4200/room/${stateData.roomId}?auth=success`;
        }
      } catch (parseError) {
        console.error('Error parsing state parameter:', parseError);
      }
    }
    
    res.redirect(redirectUrl);
    
  } catch (error) {
    console.error('Google auth callback error:', error);
    
    // Try to redirect to room even on error if we have state
    let errorRedirectUrl = 'http://localhost:4200?auth=error';
    
    if (req.query.state) {
      try {
        const stateData = JSON.parse(req.query.state);
        if (stateData.roomId) {
          errorRedirectUrl = `http://localhost:4200/room/${stateData.roomId}?auth=error`;
        }
      } catch (parseError) {
        console.error('Error parsing state parameter on error:', parseError);
      }
    }
    
    res.redirect(errorRedirectUrl);
  }
});*/
// OPTIONAL: Add revoke auth endpoint

router.get('/callback', async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  res.send('Google authentication successful. You can now create meetings!');
});

router.post('/revoke-auth', async (req, res) => {
  try {
    if (oauth2Client.credentials) {
      await oauth2Client.revokeCredentials();
      console.log('Authentication revoked successfully');
    }
    res.json({ message: 'Authentication revoked successfully' });
  } catch (error) {
    console.error('Error revoking authentication:', error);
    res.status(500).json({ message: 'Error revoking authentication' });
  }
});

module.exports = router;