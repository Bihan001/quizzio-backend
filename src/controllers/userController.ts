import catchAsync from '../utils/catchAsync';
import { SuccessResponse } from '../utils/response-handler';
import { CustomRequest } from '../utils/CustomInterfaces/CustomRequest';
import CustomError from '../errors/custom-error';
import { Response, Request, NextFunction } from 'express';
import db, { getDb } from '../database/dbConnection';
import { parseExam } from '../utils/examFunctions';
import scheduler from 'node-cron';
import { v4 as uuid } from 'uuid';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const defaultDp =
  'https://www.tenforums.com/geek/gars/images/2/types/thumb_15951118880user.png';

export const getuser = catchAsync(async (req: CustomRequest, res: Response) => {
  const db = getDb();
  let id: String = req.body.id || '';
  let query = 'select * from `User` where `id` = ?';
  const [rows, fields] = await db.execute(query, [id]);
  if (rows && rows.length > 0) {
    res.status(200).json(SuccessResponse(rows[0], 'User Found !'));
    console.log(rows);
  } else res.status(500).send('User Not Found !');
});

//Register =====================================
export const registerUser = catchAsync(async (req: Request, res: Response) => {
  const db = getDb();
  const { name, email, password, institution, phoneNumber, age, gender } =
    req.body;
  if (
    !name ||
    !email ||
    !password ||
    !institution ||
    !phoneNumber ||
    !age ||
    !gender
  )
    throw new CustomError('Some Fields are missing !', 500);
  let findByEmail =
    'select count(*) as userExists from `User` where `email`=? limit 1';
  let [rows] = await db.execute(findByEmail, [email]);
  if (rows[0].userExists)
    throw new CustomError('User with this email id already exists !', 500);
  let registerUser =
    'insert into `User` (`id`,`name`,`email`,`image`,`password`,`institution`,`phoneNumber`,`age`,`gender`) values(?,?,?,?,?,?,?,?,?)';
  const salt = await bcrypt.genSalt();
  const passwordHash = await bcrypt.hash(password, salt);
  let id = uuid();
  const result = await db.execute(registerUser, [
    id,
    name,
    email,
    defaultDp,
    passwordHash,
    institution,
    phoneNumber,
    age,
    gender,
  ]);
  if (result)
    res.status(200).json(
      SuccessResponse(
        {
          id,
          name,
          email,
          image: defaultDp,
          institution,
          phoneNumber,
          age,
          gender,
        },
        'User Inserted !'
      )
    );
  else throw new CustomError('User not inserted!', 500);
});
//==============================================

//login ========================================
export const loginUser = catchAsync(async (req: Request, res: Response) => {
  const db = getDb();
  const { email, password } = req.body;
  if (!email || !password)
    throw new CustomError('Some Fields are missing !', 500);
  let findByEmail = 'select * from `User` where `email`=?';
  let [rows, fields] = await db.execute(findByEmail, [email]);
  if (rows.length != 1) throw new CustomError('No User with this Email!', 500);
  const user = rows[0];
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new CustomError("Password does'nt match !", 404);
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET!);
  res
    .status(200)
    .json(
      SuccessResponse({ token: 'Bearer ' + token, user }, 'User Logged in!')
    );
});
//==============================================

//logout ========================================
export const logoutUser = catchAsync(
  async (req: CustomRequest, res: Response) => {
    res.status(200).send('Logout Successfull !');
  }
);
//================================================

//edit==========================================
export const editUser = catchAsync(
  async (req: CustomRequest, res: Response) => {}
);
//==============================================

export const registerInExam = catchAsync(
  async (req: CustomRequest, res: Response) => {
    const db = getDb();
    let query;
    const { examId, userId, email } = req.body;
    //check if the ids are valid then insert in exam-participants table
    query =
      'select isPrivate,userId as creatorId,count(*) as examExists,finished from `Exam` where `id`=? limit 1';
    let [rows] = await db.execute(query, [examId]);
    console.log(rows);
    let { isPrivate, creatorId, examExists, finished } = rows[0];
    if (!examExists) throw new CustomError('Exam not Found', 500);
    if (creatorId === userId)
      throw new CustomError('Creator cannot give Exam !', 500);
    if (isPrivate) {
      query =
        'select count(*) as userAllowed from `Private-Exam-Emails` where `email`=? limit 1';
      let [rows] = await db.execute(query, [email]);
      //console.log(rows);
      if (!rows[0].userAllowed)
        throw new CustomError('Not allowed to enter !', 404);
    }

    query =
      'select count(*) as alreadyRegistered from `Exam-Participants` where `participantId`=? and `examId`=? limit 1';
    [rows] = await db.execute(query, [userId, examId]);
    if (rows[0].alreadyRegistered)
      throw new CustomError('User already Registered !', 500);

    query =
      'insert into `Exam-Participants` (`examId`,`participantId`,`virtual`) values(?,?,?)';
    let result = await db.execute(query, [examId, userId, finished]);
    if (!result) throw new CustomError('Registering failed !', 500);
    res.status(200).send('Successfully Registered !');
  }
);

export const getExam = catchAsync(async (req: CustomRequest, res: Response) => {
  const db = getDb();
  const { examId, userId } = req.body;
  let query = 'select * from `Exam` where `id`=? limit 1';
  let [examRows] = await db.execute(query, [examId]);
  if (examRows.length != 1) throw new CustomError('Exam not found !', 500);
  examRows[0] = parseExam(examRows[0]);
  query =
    'select count(*) as userRegistered,virtual from `Exam-Participants` where `participantId`=? limit 1';
  let [rows] = await db.execute(query, [userId]);
  if (!rows[0].userRegistered)
    throw new CustomError('User not yet Registered !', 500);
  if (rows[0].virtual)
    return res
      .status(200)
      .json(SuccessResponse(examRows[0], 'Virtual Exam Started !'));
  if (!examRows[0].ongoing)
    throw new CustomError('Exam has not started yet !', 500);

  res.status(200).json(SuccessResponse(examRows[0], 'Exam Started !'));
});
