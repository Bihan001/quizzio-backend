"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
require('dotenv').config();
const fileTypes = ['image/jpeg', 'image/png'];
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, process.env.UPLOADS_FOLDER_LOCAL);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now().toString() + '-' + file.originalname);
    },
});
const fileFilter = (req, file, cb) => {
    if (fileTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb({ message: 'File format not supported' }, false);
    }
};
exports.default = (0, multer_1.default)({
    storage,
    fileFilter,
});
