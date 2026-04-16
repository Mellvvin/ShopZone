const path = require('path');
const express = require('express');
const multer = require('multer');
const router = express.Router();

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
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'No file uploaded! Check your field name.' });
  }
  res.send(`/${req.file.path.replace(/\\/g, "/")}`);
});

module.exports = router;