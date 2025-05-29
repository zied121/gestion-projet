const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Since both this file and uploads are in middleware:
const uploadDir = path.join(__dirname, 'uploads'); // __dirname = middleware directory

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Upload directory created at: ${uploadDir}`);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Use the verified directory
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, uniqueName);
  }
});

// File filter example (optional security)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  cb(null, allowedTypes.includes(ext));
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB limit
  }
});

// Test the directory is writable
fs.access(uploadDir, fs.constants.W_OK, (err) => {
  if (err) {
    console.error('Upload directory not writable:', err);
  } else {
    console.log('Upload directory is writable');
  }
});

module.exports = upload;