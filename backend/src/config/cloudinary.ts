import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { env } from './env';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'campusos_notes',
    resource_type: 'auto', // supports raw files like pdf, docx
    allowed_formats: ['pdf', 'doc', 'docx', 'jpg', 'png', 'jpeg'],
  } as any, // bypassing strict types for Cloudinary params which are sometimes incomplete
});

export default cloudinary;
