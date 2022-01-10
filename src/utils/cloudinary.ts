import { v2 as cloudinary } from 'cloudinary';
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

export default function uploader(filePath: string, folder = 'exam_simulation_images') {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        folder,
        resource_type: 'auto',
      },
      (err, result: any) => {
        if (err) {
          reject(err);
        } else {
          resolve({ url: result.secure_url, public_id: result.public_id });
        }
      }
    );
  });
}
