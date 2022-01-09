import catchAsync from '../utils/catchAsync';
import { SuccessResponse } from '../utils/response-handler';
import { CustomRequest } from '../utils/CustomInterfaces/CustomRequest';
import CustomError from '../errors/custom-error';
import { Response, Request } from 'express';
import { getDb } from '../database/dbConnection';
import cloudinaryUploader from '../utils/cloudinary';
import fs from 'fs';

export const uploadImages = catchAsync(async (req: Request, res: Response) => {
  const uploader = async (path: string) => await cloudinaryUploader(path);

  const files = req.files as Express.Multer.File[];
  const urls = [];
  for (const file of files) {
    const { path } = file;
    const newPath = await uploader(path);
    urls.push(newPath);
    fs.unlinkSync(path);
  }
  return res.status(200).json(SuccessResponse({ urls }, 'Successfully uploaded images'));
});
