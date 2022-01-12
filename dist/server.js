"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const custom_error_1 = __importDefault(require("./errors/custom-error"));
const response_handler_1 = require("./utils/response-handler");
const routes_1 = __importDefault(require("./routes/api/exam/routes"));
const routes_2 = __importDefault(require("./routes/api/user/routes"));
const routes_3 = __importDefault(require("./routes/api/utils/routes"));
const dbConnection_1 = require("./database/dbConnection");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    credentials: true,
    origin: (origin, callback) => {
        return callback(null, true);
    },
}));
app.use(express_1.default.json());
require("dotenv").config();
app.use("/exam", routes_1.default);
app.use("/user", routes_2.default);
app.use("/utils", routes_3.default);
//connecting database
(0, dbConnection_1.connectDatabase)();
//===================
// All middlewares goes above this
app.all("*", (req, res, next) => {
    const err = new custom_error_1.default("Non-existant route", 404);
    next(err);
});
app.use((err, req, res, next) => {
    if (err instanceof custom_error_1.default) {
        return res.status(err.statusCode).json((0, response_handler_1.ErrorResponse)(err));
    }
    return res.status(500).json((0, response_handler_1.ErrorResponse)(err));
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
