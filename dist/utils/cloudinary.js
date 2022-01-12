"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("cloudinary");
require('dotenv').config();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
function uploader(filePath, folder = 'exam_simulation_images') {
    return new Promise((resolve, reject) => {
        cloudinary_1.v2.uploader.upload(filePath, {
            folder,
            resource_type: 'auto',
        }, (err, result) => {
            if (err) {
                reject(err);
            }
            else {
                resolve({ url: result.secure_url, public_id: result.public_id });
            }
        });
    });
}
exports.default = uploader;
