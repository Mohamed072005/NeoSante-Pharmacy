import * as multer from 'multer';
import { BadGatewayException } from "@nestjs/common";

export const multerConfig = {
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    console.log('File received:', file.originalname, 'mimetype:', file.mimetype);
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true); // Accept the file
    } else {
      cb(new BadGatewayException('Invalid file type. Only JPEG, PNG, WEBP, and JPG are allowed.'));
    }
  },
}