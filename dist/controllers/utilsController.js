"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImages = void 0;
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const response_handler_1 = require("../utils/response-handler");
const cloudinary_1 = __importDefault(require("../utils/cloudinary"));
const fs_1 = __importDefault(require("fs"));
exports.uploadImages = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uploader = (path) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, cloudinary_1.default)(path); });
    const files = req.files;
    const urls = [];
    for (const file of files) {
        const { path } = file;
        const newPath = yield uploader(path);
        urls.push(newPath);
        fs_1.default.unlinkSync(path);
    }
    return res.status(200).json((0, response_handler_1.SuccessResponse)({ urls }, 'Successfully uploaded images'));
}));
