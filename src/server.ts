import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import CustomError from "./errors/custom-error";
import { SuccessResponse, ErrorResponse } from "./utils/response-handler";
import examRoutes from "./routes/api/exam/routes";
import userRoutes from "./routes/api/user/routes";
import utilsRoutes from "./routes/api/utils/routes";

import { connectDatabase } from "./database/dbConnection";

const app = express();

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      return callback(null, true);
    },
  })
);
app.use(express.json());
require("dotenv").config();
app.use("/exam", examRoutes);
app.use("/user", userRoutes);
app.use("/utils", utilsRoutes);

//connecting database
connectDatabase();
//===================

if (process.env.NODE_ENV === 'production') {
  //Set static folder
  app.use(express.static('build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
  });
}

// All middlewares goes above this

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new CustomError("Non-existant route", 404);
  next(err);
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json(ErrorResponse(err));
  }
  return res.status(500).json(ErrorResponse(err));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
