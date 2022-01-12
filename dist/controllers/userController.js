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
exports.getExamGiven = exports.getExamHosted = exports.editUser = exports.logoutUser = exports.loginUser = exports.registerUser = exports.getuser = exports.getCurrentUser = void 0;
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const response_handler_1 = require("../utils/response-handler");
const custom_error_1 = __importDefault(require("../errors/custom-error"));
const dbConnection_1 = require("../database/dbConnection");
const uuid_1 = require("uuid");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const defaultDp = 'https://www.tenforums.com/geek/gars/images/2/types/thumb_15951118880user.png';
exports.getCurrentUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(200).json((0, response_handler_1.SuccessResponse)(req.user, 'User found'));
}));
exports.getuser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = (0, dbConnection_1.getDb)();
    const id = req.params.id || '';
    let query = 'select * from `User` where `id` = ?';
    const [rows, fields] = yield db.execute(query, [id]);
    if (rows && rows.length > 0) {
        res.status(200).json((0, response_handler_1.SuccessResponse)(rows[0], 'User Found !'));
        //console.log(rows);
    }
    else
        res.status(500).send('User Not Found !');
}));
//Register =====================================
exports.registerUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = (0, dbConnection_1.getDb)();
    const { name, email, bio, password, institution, phoneNumber, dob, address, gender, } = req.body;
    if (!name ||
        !email ||
        !password ||
        !institution ||
        !phoneNumber ||
        !dob ||
        !gender)
        throw new custom_error_1.default('Some Fields are missing !', 500);
    let findByEmail = 'select count(*) as userExists from `User` where `email`=? limit 1';
    let [rows] = yield db.execute(findByEmail, [email]);
    if (rows[0].userExists)
        throw new custom_error_1.default('User with this email id already exists !', 500);
    let registerUser = 'insert into `User` (`id`,`name`,`email`,`bio`,`image`,`password`,`institution`,`phoneNumber`,`dob`,`address`,`gender`) values(?,?,?,?,?,?,?,?,?,?,?)';
    const salt = yield bcrypt_1.default.genSalt();
    const passwordHash = yield bcrypt_1.default.hash(password, salt);
    let id = (0, uuid_1.v4)();
    const result = yield db.execute(registerUser, [
        id,
        name,
        email,
        bio || ' ',
        defaultDp,
        passwordHash,
        institution,
        phoneNumber,
        dob,
        address || ' ',
        gender,
    ]);
    const user = {
        id,
        name,
        email,
        bio,
        image: defaultDp,
        institution,
        phoneNumber,
        dob,
        address: address || ' ',
        gender,
    };
    const token = jsonwebtoken_1.default.sign(user, process.env.ACCESS_TOKEN_SECRET);
    if (result)
        res.status(200).json((0, response_handler_1.SuccessResponse)({ token, user }, 'User Inserted !'));
    else
        throw new custom_error_1.default('User not inserted!', 500);
}));
//==============================================
//login ========================================
exports.loginUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = (0, dbConnection_1.getDb)();
    const { email, password } = req.body;
    if (!email || !password)
        throw new custom_error_1.default('Some Fields are missing !', 500);
    let findByEmail = 'select * from `User` where `email`=?';
    let [rows, fields] = yield db.execute(findByEmail, [email]);
    if (rows.length != 1)
        throw new custom_error_1.default('No User with this Email!', 500);
    const user = rows[0];
    const isMatch = yield bcrypt_1.default.compare(password, user.password);
    delete user.password;
    if (!isMatch)
        throw new custom_error_1.default("Password does'nt match !", 404);
    const token = jsonwebtoken_1.default.sign(user, process.env.ACCESS_TOKEN_SECRET);
    res.status(200).json((0, response_handler_1.SuccessResponse)({ token, user }, 'User Logged in!'));
}));
//==============================================
//logout ========================================
exports.logoutUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).send('Logout Successfull !');
}));
//================================================
//edit==========================================
exports.editUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const db = (0, dbConnection_1.getDb)();
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { name, bio, institution, phoneNumber, dob, address, image, gender } = req.body;
    if (!name || !institution || !phoneNumber || !dob || !gender)
        throw new custom_error_1.default('Some Fields are missing !', 500);
    let query = 'update `User` set `name`=?, bio=?, `institution`=?, `phoneNumber`=?, `dob`=?, `address`=?, `image`=?, `gender`=? where `id`=?';
    const [rows] = yield db.execute(query, [
        name,
        bio,
        institution,
        phoneNumber,
        dob,
        address,
        image,
        gender,
        userId,
    ]);
    if (!rows.affectedRows)
        throw new custom_error_1.default('User Not updated', 500);
    return res.status(200).json((0, response_handler_1.SuccessResponse)(req.user, 'User Updated!'));
}));
//==============================================
exports.getExamHosted = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const db = (0, dbConnection_1.getDb)();
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
    let query = 'select id,name,description,image,userId,tags,startTime,duration,ongoing,finished,isPrivate from `Exam` where `userId`=?';
    const [rows] = yield db.execute(query, [userId]);
    res.status(200).json((0, response_handler_1.SuccessResponse)(rows, 'The Exam hosted are'));
}));
exports.getExamGiven = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const db = (0, dbConnection_1.getDb)();
    const userId = (_c = req.user) === null || _c === void 0 ? void 0 : _c.id;
    console.log(req.user);
    const query = 'select e.* from `Exam` as e,`Exam-Participants` as ep where ep.`examId`=e.`id` and ep.`participantId`=?';
    const [rows] = yield db.execute(query, [userId]);
    res.status(200).json((0, response_handler_1.SuccessResponse)(rows, 'Exams given are : '));
}));
