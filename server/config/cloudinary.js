const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dstjwc4fj',
  api_key: '549383315269619',
  api_secret: '0j7u8sLyyBxVnVW0EAtwGofWKa4',
  timeout: 60000 // 60 seconds

});

module.exports = cloudinary;
 