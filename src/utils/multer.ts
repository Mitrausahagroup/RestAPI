import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage(); // Simpan sementara di memori
export const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // max 5MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext.toLowerCase())) {
      return cb(new Error('Only JPG, JPEG, PNG, WEBP'));
    }
    cb(null, true);
  },
});