"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dbConnection_1 = require("../database/dbConnection");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const custom_error_1 = __importDefault(require("../errors/custom-error"));
exports.default = (req, res, next) => {
    const db = (0, dbConnection_1.getDb)();
    const authHeader = req.headers['authorization'];
    const token = (authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(' ')[1]) || '';
    if (!token)
        throw new custom_error_1.default('Token Not Found!', 403);
    jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err || !user)
            throw new custom_error_1.default('Token Invalid!', 403);
        req.user = user;
        next();
    });
};
