import catchAsync from '../utils/catchAsync';
import { SuccessResponse } from '../utils/response-handler';
import { CustomRequest } from '../utils/CustomInterfaces/CustomRequest';
import CustomError from '../errors/custom-error';
import { Response, Request } from 'express';
import { getDb } from '../database/dbConnection';
import { v4 as uuid } from 'uuid';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const defaultDp =
  'https://www.tenforums.com/geek/gars/images/2/types/thumb_15951118880user.png';

export const getCurrentUser = catchAsync(
  async (req: CustomRequest, res: Response) => {
    return res.status(200).json(SuccessResponse(req.user, 'User found'));
  }
);

export const getuser = catchAsync(async (req: CustomRequest, res: Response) => {
  const db = getDb();
  const id: String = req.params.id || '';
  let query = 'select * from `User` where `id` = ?';
  const [rows, fields] = await db.execute(query, [id]);
  if (rows && rows.length > 0) {
    res.status(200).json(SuccessResponse(rows[0], 'User Found !'));
    //console.log(rows);
  } else res.status(500).send('User Not Found !');
});

//Register =====================================
export const registerUser = catchAsync(async (req: Request, res: Response) => {
  const db = getDb();
  const {
    name,
    email,
    bio,
    password,
    institution,
    phoneNumber,
    dob,
    address,
    gender,
  } = req.body;
  if (
    !name ||
    !email ||
    !password ||
    !institution ||
    !phoneNumber ||
    !dob ||
    !gender
  )
    throw new CustomError('Some Fields are missing !', 500);
  let findByEmail =
    'select count(*) as userExists from `User` where `email`=? limit 1';
  let [rows] = await db.execute(findByEmail, [email]);
  if (rows[0].userExists)
    throw new CustomError('User with this email id already exists !', 500);
  let registerUser =
    'insert into `User` (`id`,`name`,`email`,`bio`,`image`,`password`,`institution`,`phoneNumber`,`dob`,`address`,`gender`) values(?,?,?,?,?,?,?,?,?,?,?)';
  const salt = await bcrypt.genSalt();
  const passwordHash = await bcrypt.hash(password, salt);
  let id = uuid();
  const result = await db.execute(registerUser, [
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
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET!);
  if (result)
    res.status(200).json(SuccessResponse({ token, user }, 'User Inserted !'));
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
  delete user.password;
  if (!isMatch) throw new CustomError("Password does'nt match !", 404);
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET!);
  res.status(200).json(SuccessResponse({ token, user }, 'User Logged in!'));
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
  async (req: CustomRequest, res: Response) => {
    const db = getDb();
    const userId = req.user?.id;
    return res.status(200).json(SuccessResponse(req.user, 'User Updated!'));
  }
);
//==============================================

export const getExamHosted = catchAsync(
  async (req: CustomRequest, res: Response) => {
    const db = getDb();
    const userId = req.user?.id;
    let query =
      'select id,name,description,image,userId,tags,startTime,duration,ongoing,finished,isPrivate from `Exam` where `userId`=?';
    const [rows] = await db.execute(query, [userId]);
    res.status(200).json(SuccessResponse(rows, 'The Exam hosted are'));
  }
);

export const getExamGiven = catchAsync(
  async (req: CustomRequest, res: Response) => {
    const db = getDb();
    const userId = req.user?.id;
    console.log(req.user);
    const query =
      'select e.* from `Exam` as e,`Exam-Participants` as ep where ep.`examId`=e.`id` and ep.`participantId`=?';
    const [rows] = await db.execute(query, [userId]);
    res.status(200).json(SuccessResponse(rows, 'Exams given are : '));
  }
);
