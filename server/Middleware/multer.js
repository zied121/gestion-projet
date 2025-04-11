const multer = require('multer');
const storage = multer.memoryStorage(); // Keep it in memory to pass to Cloudinary
const upload = multer({ storage });

module.exports = upload;
