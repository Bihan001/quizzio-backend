import catchAsync from '../utils/catchAsync';
import { SuccessResponse } from '../utils/response-handler';
import CustomError from '../errors/custom-error';
import { Response, Request, NextFunction } from 'express';
import db, { getDb } from '../database/dbConnection';
import { v4 as uuid } from 'uuid';
import { CustomRequest } from '../utils/CustomInterfaces/CustomRequest';
import {
  mcqInterface,
  fillInTheBlanksInterface,
  multipleOptionsInterface,
} from '../utils/CustomInterfaces/QuestionInterfaces';
import {
  scheduleExam,
  destroyScheduler,
  parseExam,
  shuffleExam,
  removeCorrectOptions,
  evaluateExam,
  getExamWithUserAns,
} from '../utils/examFunctions';
import { parse } from 'path';

const defaultBannerImage =
  'https://image.freepik.com/free-vector/online-exam-isometric-web-banner_33099-2305.jpg';

export const testing = catchAsync(async (req: Request, res: Response) =>
  res.status(200).send('Server is up and running!')
);

export const createTables = catchAsync(async (req: Request, res: Response) => {
  const db = getDb();
  let query, result;

  await db.execute('drop table if exists `Exam-Participants`');
  await db.execute('drop table if exists Exam');
  await db.execute('drop table if exists User');
  await db.execute('drop table if exists `Private-Exam-Emails`');

  //User table===================
  query =
    'create table User ( id varchar(50) not null, name varchar(50) , email varchar(50) ,bio longtext, dob datetime , address longtext,image longtext, password longtext ,institution longtext ,gender varchar(50),phoneNumber varchar(50) ,constraint user_pk primary key(id) )';
  result = await db.execute(query);
  if (!result) throw new CustomError('User Table Not   created  !', 500);
  //=============================

  //Exam table==================
  query =
    'create table `Exam` ( id varchar(50) , name varchar(50) , description longtext , image longtext ,userId varchar(50),tags json, questions json , startTime bigint , duration integer ,ongoing boolean default False,finished boolean default False ,isPrivate boolean default False ,numberOfParticipants integer, constraint exam_pk primary key(id) ,constraint fk1 foreign key (userId) references User(id) )';
  result = await db.execute(query);
  if (!result) throw new CustomError('Exam Table not created !', 500);
  //============================

  //Exam-Participants table========
  query =
    'create table `Exam-Participants` (id integer auto_increment ,examId varchar(50) , participantId varchar(50) ,answers json ,totalScore integer , finishTime bigint,isVirtual boolean default False,userRank boolean default 0,constraint pk primary key(id) ,constraint fep1 foreign key (examId) references Exam(id) , constraint fep2 foreign key (participantId) references User(id))';
  result = await db.execute(query);
  if (!result)
    throw new CustomError('Exam-Participants table not created!', 500);
  //================================

  //private exam emails table====
  query =
    'create table `Private-Exam-Emails` (id integer auto_increment,examId varchar(50) , email varchar(50) , constraint pk primary key(id) , constraint fkx foreign key (examId) references Exam(id))';
  result = await db.execute(query);
  if (!result)
    throw new CustomError('Private-Exam Emails table not created !', 500);
  //=============================
  res.status(200).send('All tables created !');
});

export const getExams = catchAsync(async (req: Request, res: Response) => {
  const db = getDb();
  let query =
    'select id,name,description,image,tags,startTime,duration,ongoing,isPrivate,(SELECT COUNT(ep.id) FROM `Exam-Participants` AS ep WHERE ep.examId = Exam.id) AS numberOfParticipants from `Exam`';
  let [rows] = await db.execute(query);
  rows.map((exam: any) => {
    exam = parseExam(exam);
  });
  res
    .status(200)
    .json(SuccessResponse(rows, 'These are upcoming and ongoing Exams !'));
});

export const getExamDetails = catchAsync(
  async (req: Request, res: Response) => {
    const db = getDb();
    const examId = req.params.id;
    let query =
      "select id,name,description,questions,image,tags,startTime,duration,ongoing,isPrivate,(SELECT COUNT(ep.id) FROM `Exam-Participants` AS ep WHERE ep.examId = Exam.id) AS numberOfParticipants, (SELECT JSON_OBJECT('id',u.id,'name',u.name,'image', u.image) FROM User AS u WHERE u.id = Exam.userId) AS user from Exam where id=? limit 1";
    let [rows] = await db.execute(query, [examId]);
    if (rows.length != 1) throw new CustomError('Exam not found', 500);
    parseExam(rows[0]);
    let totalMarks = 0;
    rows[0].questions?.map(
      (
        question:
          | mcqInterface
          | multipleOptionsInterface
          | fillInTheBlanksInterface
      ) => {
        totalMarks += question.marks;
      }
    );
    rows[0].user = JSON.parse(rows[0].user);
    rows[0].totalMarks = totalMarks;
    delete rows[0].questions;
    res.status(200).json(SuccessResponse(rows[0], 'Exam Found !'));
  }
);

export const createExam = catchAsync(
  async (req: CustomRequest, res: Response) => {
    const db = getDb();
    const userId = req.user?.id;
    let data = req.body || {};
    let query =
      'insert into `Exam` (`id`,`name`,`description`,`image`,`userId`,`tags`,`questions`,`startTime`,`duration`,`isPrivate`) values(?,?,?,?,?,?,?,?,?,?)';
    data.id = uuid();
    const result1 = await db.execute(query, [
      data.id,
      data.name,
      data.description || ' ',
      data.image?.trim() || defaultBannerImage,
      userId,
      JSON.stringify(data.tags),
      JSON.stringify(data.questions),
      data.startTime,
      data.duration,
      data.isPrivate,
    ]);
    if (!result1) throw new CustomError('Exam not created !', 500);
    if (data.isPrivate && data.allowedUsers.length > 0) {
      query = 'insert into `Private-Exam-Emails` (`examId`,`email`) values ';
      let queryArray: any = [];
      data.allowedUsers.map((allowedUserEmail: String) => {
        queryArray.push(`('` + data.id + `','` + allowedUserEmail + `')`);
      });
      queryArray = queryArray.join(',');
      let result2 = await db.execute(query + queryArray);
      if (!result2)
        throw new CustomError(
          'Failed to set Private User in Private-Exam-Email table',
          500
        );
    }
    scheduleExam(data.id, data.startTime, data.duration);
    return res.status(200).json(SuccessResponse({}, 'Exam Created!'));
  }
);

export const editExam = catchAsync(
  async (req: CustomRequest, res: Response) => {
    const db = getDb();
    // if(!req.user) throw new CustomError("User Error",404);
    const examId = req.params.id;
    const userId = req.user?.id;
    const {
      name,
      description,
      image,
      tags,
      questions,
      startTime,
      duration,
      isPrivate,
      allowedUsers,
    } = req.body;
    let getExamByUserId =
      'select count(*) as examExists from `Exam` where `userId`=? and `id`=? limit 1';
    let [rows] = await db.execute(getExamByUserId, [userId, examId]); //authorization to be added ! to e compared with req.user.id and req.body.userId
    console.log(rows);
    if (!rows[0].examExists) throw new CustomError('Exam not found !', 500);
    //console.log(rows[0]);
    let date = new Date();
    date.setSeconds(date.getSeconds() + 60);
    let updateExam =
      'update `Exam` set `name`=? ,`description`=?,`image`=?,`tags` = ?, `questions`=? , `startTime`=? , `duration`=? , `isPrivate`=? where `id`=?';
    let result1 = await db.execute(updateExam, [
      name,
      description || '',
      image.trim() || defaultBannerImage,
      JSON.stringify(tags),
      JSON.stringify(questions),
      date,
      duration,
      isPrivate,
      examId,
    ]);
    if (!result1) throw new CustomError('Exam not updated !', 500);

    let deleteByEmail = 'delete from `Private-Exam-Emails` where `examId`=?';
    const result2 = await db.execute(deleteByEmail, [examId]);
    if (!result2)
      throw new CustomError('Delete from Private-Exam-Emails failed !', 500);

    if (isPrivate && allowedUsers.length > 0) {
      let query =
        'insert into `Private-Exam-Emails` (`examId`,`email`) values ';
      let queryArray: any = [];
      allowedUsers.map((allowedUserEmail: String) => {
        queryArray.push(`('` + examId + `','` + allowedUserEmail + `')`);
      });
      queryArray = queryArray.join(',');
      let result3 = await db.execute(query + queryArray);
      if (!result3)
        throw new CustomError(
          'Failed to update Private User in Private-Exam-Email table',
          500
        );
    }
    // destroyScheduler(examId + 'start');
    // destroyScheduler(examId + 'end');
    // scheduleExam(examId, date, duration);
    return res.status(200).json(SuccessResponse({}, 'Exam Updated!'));
  }
);

export const registerInExam = catchAsync(
  async (req: CustomRequest, res: Response) => {
    const db = getDb();
    let query;
    const { examId } = req.body;
    const userId = req.user?.id;
    const email = req.user?.email;
    //check if the ids are valid then insert in exam-participants table
    query =
      'select isPrivate,userId as creatorId,count(*) as examExists,finished,startTime,duration from `Exam` where `id`=? limit 1';
    let [rows] = await db.execute(query, [examId]);
    // console.log(rows);
    let { isPrivate, creatorId, examExists, finished, startTime, duration } =
      rows[0];
    if (!examExists) throw new CustomError('Exam not Found', 500);
    if (creatorId === userId)
      throw new CustomError('Creator cannot give Exam !', 500);
    const currTime = new Date().getTime();
    if (currTime >= startTime && currTime <= startTime + duration + 120000)
      throw new CustomError(
        'Not a valid time to register! Let the evaluation finish!',
        500
      );
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
      'insert into `Exam-Participants` (`examId`,`participantId`,`isVirtual`) values(?,?,?)';
    let result = await db.execute(query, [examId, userId, finished]);
    if (!result) throw new CustomError('Registering failed !', 500);
    res.status(200).send('Successfully Registered !');
  }
);

export const startExam = catchAsync(
  async (req: CustomRequest, res: Response) => {
    const db = getDb();
    const examId = req.params.id;
    const userId = req.user?.id;
    let query = 'select * from `Exam` where `id`=? limit 1';
    let [examRows] = await db.execute(query, [examId]);
    if (examRows.length != 1) throw new CustomError('Exam not found !', 500);
    examRows[0] = parseExam(examRows[0]);
    shuffleExam(examRows[0]);
    removeCorrectOptions(examRows[0]);
    query =
      'select count(*) as userRegistered,isVirtual,answers from `Exam-Participants` where `participantId`=? and `examId`=? limit 1';
    let [rows] = await db.execute(query, [userId, examId]);
    console.log(rows);
    if (!rows[0].userRegistered)
      throw new CustomError('User not yet Registered !', 500);
    if (rows[0].answers)
      throw new CustomError('Answers already Submitted!', 500);
    if (rows[0].isVirtual)
      return res
        .status(200)
        .json(SuccessResponse(examRows[0], 'Virtual Exam Started !'));
    if (!examRows[0].ongoing)
      throw new CustomError('Exam has not started yet !', 500);

    //console.log(shuffleExam(examRows[0]));
    res.status(200).json(SuccessResponse(examRows[0], 'Exam Started !'));
  }
);

export const submitExam = catchAsync(
  async (req: CustomRequest, res: Response) => {
    const db = getDb();
    let query;
    const { answers, finishTime, examId } = req.body;
    const participantId = req.user?.id;
    if (!answers || !finishTime || !participantId || !examId)
      throw new CustomError('Fields are missing !', 500);
    query =
      'select `startTime`+`duration` as `endTime` from `Exam` where `id`=? limit 1';
    let [rows] = await db.execute(query, [examId]);
    if (rows.length != 1) throw new CustomError('Exam not found!', 500);
    if (finishTime > rows[0].endTime + 15000)
      //extra 15secs
      throw new CustomError('Not a valid time to submit! Exam Finished!', 500);

    query =
      'update `Exam-Participants` set `answers`=? , `finishTime`=? where  `participantId`=?  and `examId`=?';
    [rows] = await db.execute(query, [
      JSON.stringify(answers),
      finishTime,
      participantId,
      examId,
    ]);
    if (!rows.affectedRows)
      throw new CustomError('Error occured while submitting! :(', 500);
    res
      .status(200)
      .json(SuccessResponse(rows[0], 'Exam Submitted Successfully!'));
  }
);

export const forceEvaluateExam = catchAsync(
  async (req: Request, res: Response) => {
    const id: any = req.query.id;
    await evaluateExam(id);
    res.status(200).send('Evaluation Completed!');
  }
);

export const getTags = catchAsync(async (req: Request, res: Response) => {
  const tags: String[] = [
    'Maths',
    'Physics',
    'Chemistry',
    'Exam',
    'Contest',
    'Computer Science',
    'Competitive Programming',
    'Dynamic Programming',
    'Graph Theory',
    'Literature',
  ];
  res.status(200).json(SuccessResponse(tags, 'The tags are :'));
});

export const getQuestionTypes = catchAsync(
  async (req: Request, res: Response) => {
    const questionTypes = [
      { label: 'MCQ Single Option', value: 'mcq' },
      { label: 'Fill in the blanks', value: 'fillInTheBlanks' },
      { label: 'MCQ Multiple Options', value: 'multipleOptions' },
    ];
    res
      .status(200)
      .json(SuccessResponse(questionTypes, 'The question types are :'));
  }
);

export const examRegisterStatus = catchAsync(
  async (req: CustomRequest, res: Response) => {
    const db = getDb();
    const userId = req.user?.id;
    const examId = req.query.examId;
    let query =
      'select count(*) registered from `Exam-Participants` where `examId`=? and `participantId`=?';
    const [rows] = await db.execute(query, [examId, userId]);
    res
      .status(200)
      .json(
        SuccessResponse(
          { registered: rows[0].registered },
          'Register status of the user is:'
        )
      );
  }
);

//this route uses customized question object for algorithm purposes!
export const getExamSolution = catchAsync(
  async (req: CustomRequest, res: Response) => {
    const db = getDb();
    const examId = req.query.examId;
    const userId = req.user?.id;
    let examQuestions;
    let query = 'select questions,finished from `Exam` where `id`=? limit 1';
    let [rows] = await db.execute(query, [examId]);
    if (rows.length != 1) throw new CustomError('Exam not found!', 500);
    if (!rows[0].finished)
      res.status(200).json(SuccessResponse(null, 'Exam not yet finished!'));
    examQuestions = JSON.parse(rows[0].questions);
    let questionsObj: any = {};
    examQuestions.map((question: any) => {
      questionsObj[question.id] = question;
    });
    examQuestions = questionsObj;
    query =
      'select answers from `Exam-Participants` where `participantId`=? and `examId`=? limit 1';
    [rows] = await db.execute(query, [userId, examId]);
    if (rows.length != 1)
      res
        .status(200)
        .json(
          SuccessResponse(
            null,
            'Error while finding answers!, maybe user not registered!'
          )
        );
    if (!rows[0].answers)
      res.status(200).json(SuccessResponse(null, 'Answers null!'));
    let answers = JSON.parse(rows[0].answers);
    let examWithUserAns = getExamWithUserAns(examQuestions, answers);
    res
      .status(200)
      .json(SuccessResponse(examWithUserAns, 'Your solution is :'));
  }
);

export const getExamScores = catchAsync(
  async (req: CustomRequest, res: Response) => {
    const db = getDb();
    let query, rows;
    const userId = req.user?.id;
    const examId = req.query.examId;
    query = 'select `finished` from `Exam` where `id`=? limit 1';
    [rows] = await db.execute(query, [examId]);
    if (rows.length != 1) throw new CustomError('Exam not found!', 500);
    if (!rows[0].finished) throw new CustomError('Exam not finished !', 500);
    query =
      "select `participantId`, `rank`, `finishTime`, `totalScore`, (SELECT JSON_ARRAYAGG(JSON_OBJECT('participantId', ep.participantId, 'totalScore', ep.totalScore, 'userRank', ep.userRank, 'finishTime', ep.finishTime, 'name', u.name)) FROM `Exam-Participants` AS ep, `User` AS u WHERE ep.participantId = u.id AND ep.examId = e.examId ORDER BY ep.userRank LIMIT 5) AS `topPerformers` from `Exam-Participants` AS e where `participantId`=? and `examId`=? LIMIT 1";
    [rows] = await db.execute(query, [userId, examId]);
    if (rows.length != 1) throw new CustomError('Data not found!', 500);
    rows[0].topPerformers = JSON.parse(rows[0].topPerformers);
    res.status(200).json(SuccessResponse(rows[0], 'The data is : '));
  }
);
