// backend/routes/uploadRoutes.js
// ─────────────────────────────────────────────────────────────
// Image upload route — accepts a single image file and saves it
// to the local uploads/ folder.
//
// Auth: requires a logged-in user (protect middleware).
// Both admin and approved sellers can upload images.
// Images are stored locally for development — Cloudinary
// migration happens in Step 22.
// ─────────────────────────────────────────────────────────────
const path    = require('path');
const express = require('express');
const multer  = require('multer');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');

// 1. Setup Storage Engine
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/'); // Where files are saved
  },
  filename(req, file, cb) {
    // Renames file to: image-date.extension
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// 2. Filter: Only allow images (jpg, jpeg, png)
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images only!');
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// 3. The Route: Uploads a single image
// protect — must be logged in. Admin and approved sellers both
// need this route. Anonymous uploads are never allowed.
router.post('/', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'No file uploaded! Check your field name.' });
  }
  res.send(`/${req.file.path.replace(/\\/g, "/")}`);
});

module.exports = router;