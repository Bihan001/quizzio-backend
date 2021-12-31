import catchAsync from '../utils/catchAsync';
import { SuccessResponse } from '../utils/response-handler';
import CustomError from '../errors/custom-error';
import { Response, Request, NextFunction } from 'express';
import { getDb } from '../database/dbConnection';
import scheduler from 'node-schedule';
import { v4 as uuid } from 'uuid';
import { CustomRequest } from '../utils/CustomInterfaces/CustomRequest';
import {
  scheduleExam,
  destroyScheduler,
  parseExam,
} from '../utils/examFunctions';

const defaultBannerImage =
  'https://image.freepik.com/free-vector/online-exam-isometric-web-banner_33099-2305.jpg';

export const createTables = catchAsync(async (req: Request, res: Response) => {
  const db = getDb();
  let query, result;

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
    'create table `Exam-Participants` (id integer auto_increment ,examId varchar(50) , participantId varchar(50) ,answers json ,totalScore integer , finsihTime datetime,virtual boolean default False,constraint pk primary key(id) ,constraint fep1 foreign key (examId) references Exam(id) , constraint fep2 foreign key (participantId) references User(id))';
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

export const getAllUpcomingExams = catchAsync(
  async (req: Request, res: Response) => {
    const db = getDb();
    let query =
      'select id,name,description,image,tags,startTime,duration,ongoing,isPrivate,(SELECT COUNT(ep.id) FROM `Exam-Participants` AS ep WHERE ep.examId = Exam.id) AS numberOfParticipants from `Exam` where `startTime`>? or `ongoing`=?';
    let [rows] = await db.execute(query, [new Date(), true]);
    console.log(rows);
    rows.map((exam: any) => {
      exam = parseExam(exam);
    });
    res
      .status(200)
      .json(SuccessResponse(rows, 'These are upcoming and ongoing Exams !'));
  }
);

export const getExamDetails = catchAsync(
  async (req: Request, res: Response) => {
    const db = getDb();
    let query =
      "select id,name,description,image,tags,startTime,duration,ongoing,isPrivate,(SELECT COUNT(ep.id) FROM `Exam-Participants` AS ep WHERE ep.examId = Exam.id) AS numberOfParticipants, (SELECT JSON_OBJECT('id',u.id,'name',u.name,'image', u.image) FROM User AS u WHERE u.id = Exam.userId) AS user from Exam where id=? limit 1";
    let [rows] = await db.execute(query, [req.params.id]);
    parseExam(rows[0]);
    rows[0].user = JSON.parse(rows[0].user);
    if (rows.length != 1) throw new CustomError('Exam not found', 500);
    res.status(200).json(SuccessResponse(rows[0], 'Exam Found !'));
  }
);

export const createExam = catchAsync(async (req: Request, res: Response) => {
  const db = getDb();
  let query =
    'insert into `Exam` (`id`,`name`,`description`,`image`,`userId`,`tags`,`questions`,`startTime`,`duration`,`isPrivate`) values(?,?,?,?,?,?,?,?,?,?)';
  let data = req.body || {};
  data['id'] = uuid();
  const result1 = await db.execute(query, [
    data.id,
    data.name,
    data.description || ' ',
    data.image || defaultBannerImage,
    data.userId,
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

  res.status(200).send('Exam  Created');
  scheduleExam(data.id, data.date, data.duration);
});

export const editExam = catchAsync(
  async (req: CustomRequest, res: Response) => {
    // if(!req.user) throw new CustomError("User Error",404);
    const {
      name,
      description,
      image,
      tags,
      questions,
      startTime,
      duration,
      id,
      userId,
      isPrivate,
      allowedUsers,
    } = req.body;
    const db = getDb();
    let getExamByUserId =
      'select count(*) as examExists from `Exam` where `userId`=? and `id`=? limit 1';
    let [rows] = await db.execute(getExamByUserId, [
      req.body.userId,
      req.body.id,
    ]); //authorization to be added ! to e compared with req.user.id and req.body.userId
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
      image || defaultBannerImage,
      JSON.stringify(tags),
      JSON.stringify(questions),
      date,
      duration,
      isPrivate,
      id,
    ]);
    if (!result1) throw new CustomError('Exam not updated !', 500);

    let deleteByEmail = 'delete from `Private-Exam-Emails` where `examId`=?';
    const result2 = await db.execute(deleteByEmail, [id]);
    if (!result2)
      throw new CustomError('Delete from Private-Exam-Emails failed !', 500);

    if (isPrivate && allowedUsers.length > 0) {
      let query =
        'insert into `Private-Exam-Emails` (`examId`,`email`) values ';
      let queryArray: any = [];
      allowedUsers.map((allowedUserEmail: String) => {
        queryArray.push(`('` + id + `','` + allowedUserEmail + `')`);
      });
      queryArray = queryArray.join(',');
      let result3 = await db.execute(query + queryArray);
      if (!result3)
        throw new CustomError(
          'Failed to update Private User in Private-Exam-Email table',
          500
        );
    }
    res.status(200).send('Exam updated !');
    destroyScheduler(id + 'start');
    destroyScheduler(id + 'end');
    scheduleExam(id, date, duration);
  }
);
