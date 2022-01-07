import { Request, Response, NextFunction } from 'express';
import { getDb } from '../database/dbConnection';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import CustomError from '../errors/custom-error';
import { CustomRequest } from '../utils/CustomInterfaces/CustomRequest';

export default (req: CustomRequest, res: Response, next: NextFunction) => {
  const db = getDb();
  const authHeader = req.headers['authorization'] as string;
  const token = authHeader?.split(' ')[1] || '';
  if (!token) throw new CustomError('Token Not Found!', 403);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, user) => {
    if (err || !user) throw new CustomError('Token Invalid!', 403);
    req.user = user;
    next();
  });
};
