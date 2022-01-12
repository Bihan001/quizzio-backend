"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController = __importStar(require("../../../controllers/userController"));
const auth_1 = __importDefault(require("../../../middlewares/auth"));
const multer_1 = __importDefault(require("../../../utils/multer"));
const router = express_1.default.Router();
router.post('/login', userController.loginUser);
router.post('/register', userController.registerUser);
router.post('/logout', auth_1.default, userController.logoutUser);
router.get('/current', auth_1.default, userController.getCurrentUser);
router.get('/exams-hosted', auth_1.default, userController.getExamHosted);
router.get('/exams-given', auth_1.default, userController.getExamGiven);
router.get('/:id', userController.getuser);
router.patch('/', auth_1.default, multer_1.default.single('image'), userController.editUser);
exports.default = router;
