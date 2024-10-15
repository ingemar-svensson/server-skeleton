import { extname } from 'path';
import { HttpException, HttpStatus } from '@nestjs/common';

// Multer upload options
export const multerOptions = {
  // Enable file size limits
  limits: {
    fileSize: 5000000,
  },
  // Check the mimetypes to allow for upload
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|gif|mp4|mp3|tiff)$/)) {
      // Allow storage of file
      cb(null, true);
    } else {
      // Reject file
      cb(new HttpException(`Unsupported file type ${extname(file.originalname)}`, HttpStatus.BAD_REQUEST), false);
    }
  },
};