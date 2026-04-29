const express = require('express');
const router = express.Router();
const multer = require('multer');
const { upload, cloudinary } = require('../config/cloudinary');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Multer memory storage cho PDF (raw upload lên Cloudinary)
const pdfStorage = multer.memoryStorage();
const uploadPdf = multer({
  storage: pdfStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Chỉ chấp nhận file PDF!'), false);
  },
});

// POST /api/upload/images — Upload tối đa 5 ảnh (Admin only)
router.post('/images', protect, adminOnly, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Không có file nào được upload' });
    }
    const urls = req.files.map(f => ({
      url: f.path,
      publicId: f.filename,
    }));
    res.json({ images: urls, message: `Upload ${urls.length} ảnh thành công` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/upload/pdf — Upload 1 file PDF (partner ebook mẫu hoặc admin ebook)
router.post('/pdf', protect, uploadPdf.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Không có file PDF' });

    // Upload buffer lên Cloudinary dưới dạng raw
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: 'raw', folder: 'travelguide-pdfs', use_filename: true },
        (err, result) => { if (err) reject(err); else resolve(result); }
      );
      stream.end(req.file.buffer);
    });

    res.json({
      url: result.secure_url,
      publicId: result.public_id,
      message: 'Upload PDF thành công',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/upload/images/:publicId — Xóa ảnh khỏi Cloudinary
router.delete('/images/:publicId', protect, adminOnly, async (req, res) => {
  try {
    const publicId = decodeURIComponent(req.params.publicId);
    await cloudinary.uploader.destroy(publicId);
    res.json({ message: 'Đã xóa ảnh' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
