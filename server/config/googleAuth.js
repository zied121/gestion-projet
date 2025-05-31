const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(

'581478345784-o5p6krpeo9u0qn1a405lse64rpd25vf9.apps.googleusercontent.com',
  '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',
  'http://localhost:5000/api/google/callback'
);

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

module.exports = { oauth2Client, SCOPES };
