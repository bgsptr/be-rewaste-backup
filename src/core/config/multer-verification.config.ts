import { diskStorage } from 'multer';
import * as fs from 'fs';
import { join } from 'path';
import { ALLOWED_MIME_TYPES } from 'src/application/dto/verifications/verification.dto';
import { AuthenticatedRequest } from 'src/middlewares/auth.middleware';
import DayConvertion from 'src/utils/static/dayjs';

export const multerVerificationConfig = {
  storage: diskStorage({
    // destination: './uploads/images',
    // destinasi folder per image yang diupload oleh verifikator
    destination: (req: AuthenticatedRequest, file, cb) => {
      const userId = req.user?.id;
      const basePath = './uploads/images';
      const userDir = userId ? join(basePath, userId) : basePath;

      // Buat folder user jika belum ada
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
      }

      cb(null, userDir);
    },
    filename: (req, file, cb) => {
      // di frontend kalo bisa diedit original name jadi kategorisampah-userid
      const filename = `${DayConvertion.getCurrent().toISOString().split('T')[0]}-${file.originalname}`;
      cb(null, filename);
    },
  }),
  limits: {
    fileSize: 500 * 1024, // 500KB
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error(`Invalid file type: ${file.mimetype}`), false);
    }
    cb(null, true);
  },
};
