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
exports.getDb = exports.connectDatabase = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const examFunctions_1 = require("../utils/examFunctions");
let db;
const connectDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    db = yield promise_1.default.createConnection({
        host: 'mydbinstance.cyfjjout6pho.ap-south-1.rds.amazonaws.com',
        user: 'subho57',
        password: 'adminDBpassword123',
        port: 3306,
        database: 'examSimulation',
        multipleStatements: true,
        connectTimeout: 60 * 60 * 1000,
        // debug: true,
    });
    if (db) {
        console.log('Database Connected !');
        (0, examFunctions_1.scheduleOnServerRestart)();
    }
    else
        console.log('Database Not Connected !');
});
exports.connectDatabase = connectDatabase;
const getDb = () => {
    return db;
};
exports.getDb = getDb;
exports.default = db;
