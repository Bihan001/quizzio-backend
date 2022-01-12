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
exports.getExamScores = exports.getExamSolution = exports.examRegisterStatus = exports.getQuestionTypes = exports.getTags = exports.forceEvaluateExam = exports.submitExam = exports.startExam = exports.registerInExam = exports.editExam = exports.createExam = exports.getExamDetails = exports.getExams = exports.createTables = exports.testing = void 0;
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const response_handler_1 = require("../utils/response-handler");
const custom_error_1 = __importDefault(require("../errors/custom-error"));
const dbConnection_1 = require("../database/dbConnection");
const uuid_1 = require("uuid");
const examFunctions_1 = require("../utils/examFunctions");
const defaultBannerImage = 'https://image.freepik.com/free-vector/online-exam-isometric-web-banner_33099-2305.jpg';
exports.testing = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () { return res.status(200).send('Server is up and running!'); }));
exports.createTables = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = (0, dbConnection_1.getDb)();
    let query, result;
    //User table===================
    query =
        'create table User ( id varchar(50) not null, name varchar(50) , email varchar(50) ,bio longtext, dob datetime , address longtext,image longtext, password longtext ,institution longtext ,gender varchar(50),phoneNumber varchar(50) ,constraint user_pk primary key(id) )';
    result = yield db.execute(query);
    if (!result)
        throw new custom_error_1.default('User Table Not   created  !', 500);
    //=============================
    //Exam table==================
    query =
        'create table `Exam` ( id varchar(50) , name varchar(50) , description longtext , image longtext ,userId varchar(50),tags json, questions json , startTime bigint , duration integer ,ongoing boolean default False,finished boolean default False ,isPrivate boolean default False ,numberOfParticipants integer, constraint exam_pk primary key(id) ,constraint fk1 foreign key (userId) references User(id) )';
    result = yield db.execute(query);
    if (!result)
        throw new custom_error_1.default('Exam Table not created !', 500);
    //============================
    //Exam-Participants table========
    query =
        'create table `Exam-Participants` (id integer auto_increment ,examId varchar(50) , participantId varchar(50) ,answers json ,totalScore integer , finishTime bigint,virtual boolean default False,rank boolean default 0,constraint pk primary key(id) ,constraint fep1 foreign key (examId) references Exam(id) , constraint fep2 foreign key (participantId) references User(id))';
    result = yield db.execute(query);
    if (!result)
        throw new custom_error_1.default('Exam-Participants table not created!', 500);
    //================================
    //private exam emails table====
    query =
        'create table `Private-Exam-Emails` (id integer auto_increment,examId varchar(50) , email varchar(50) , constraint pk primary key(id) , constraint fkx foreign key (examId) references Exam(id))';
    result = yield db.execute(query);
    if (!result)
        throw new custom_error_1.default('Private-Exam Emails table not created !', 500);
    //=============================
    res.status(200).send('All tables created !');
}));
exports.getExams = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = (0, dbConnection_1.getDb)();
    let query = 'select id,name,description,image,tags,startTime,duration,ongoing,isPrivate,(SELECT COUNT(ep.id) FROM `Exam-Participants` AS ep WHERE ep.examId = Exam.id) AS numberOfParticipants from `Exam`';
    let [rows] = yield db.execute(query);
    rows.map((exam) => {
        exam = (0, examFunctions_1.parseExam)(exam);
    });
    res
        .status(200)
        .json((0, response_handler_1.SuccessResponse)(rows, 'These are upcoming and ongoing Exams !'));
}));
exports.getExamDetails = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const db = (0, dbConnection_1.getDb)();
    const examId = req.params.id;
    let query = "select id,name,description,image,tags,startTime,duration,ongoing,isPrivate,(SELECT COUNT(ep.id) FROM `Exam-Participants` AS ep WHERE ep.examId = Exam.id) AS numberOfParticipants, (SELECT JSON_OBJECT('id',u.id,'name',u.name,'image', u.image) FROM User AS u WHERE u.id = Exam.userId) AS user from Exam where id=? limit 1";
    let [rows] = yield db.execute(query, [examId]);
    if (rows.length != 1)
        throw new custom_error_1.default('Exam not found', 500);
    (0, examFunctions_1.parseExam)(rows[0]);
    rows[0].user = JSON.parse(rows[0].user);
    res.status(200).json((0, response_handler_1.SuccessResponse)(rows[0], 'Exam Found !'));
}));
exports.createExam = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const db = (0, dbConnection_1.getDb)();
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    let data = req.body || {};
    let query = 'insert into `Exam` (`id`,`name`,`description`,`image`,`userId`,`tags`,`questions`,`startTime`,`duration`,`isPrivate`) values(?,?,?,?,?,?,?,?,?,?)';
    data.id = (0, uuid_1.v4)();
    const result1 = yield db.execute(query, [
        data.id,
        data.name,
        data.description || ' ',
        ((_b = data.image) === null || _b === void 0 ? void 0 : _b.trim()) || defaultBannerImage,
        userId,
        JSON.stringify(data.tags),
        JSON.stringify(data.questions),
        data.startTime,
        data.duration,
        data.isPrivate,
    ]);
    if (!result1)
        throw new custom_error_1.default('Exam not created !', 500);
    if (data.isPrivate && data.allowedUsers.length > 0) {
        query = 'insert into `Private-Exam-Emails` (`examId`,`email`) values ';
        let queryArray = [];
        data.allowedUsers.map((allowedUserEmail) => {
            queryArray.push(`('` + data.id + `','` + allowedUserEmail + `')`);
        });
        queryArray = queryArray.join(',');
        let result2 = yield db.execute(query + queryArray);
        if (!result2)
            throw new custom_error_1.default('Failed to set Private User in Private-Exam-Email table', 500);
    }
    (0, examFunctions_1.scheduleExam)(data.id, data.startTime, data.duration);
    return res.status(200).json((0, response_handler_1.SuccessResponse)({}, 'Exam Created!'));
}));
exports.editExam = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const db = (0, dbConnection_1.getDb)();
    // if(!req.user) throw new CustomError("User Error",404);
    const examId = req.params.id;
    const userId = (_c = req.user) === null || _c === void 0 ? void 0 : _c.id;
    const { name, description, image, tags, questions, startTime, duration, isPrivate, allowedUsers, } = req.body;
    let getExamByUserId = 'select count(*) as examExists from `Exam` where `userId`=? and `id`=? limit 1';
    let [rows] = yield db.execute(getExamByUserId, [userId, examId]); //authorization to be added ! to e compared with req.user.id and req.body.userId
    console.log(rows);
    if (!rows[0].examExists)
        throw new custom_error_1.default('Exam not found !', 500);
    //console.log(rows[0]);
    let date = new Date();
    date.setSeconds(date.getSeconds() + 60);
    let updateExam = 'update `Exam` set `name`=? ,`description`=?,`image`=?,`tags` = ?, `questions`=? , `startTime`=? , `duration`=? , `isPrivate`=? where `id`=?';
    let result1 = yield db.execute(updateExam, [
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
    if (!result1)
        throw new custom_error_1.default('Exam not updated !', 500);
    let deleteByEmail = 'delete from `Private-Exam-Emails` where `examId`=?';
    const result2 = yield db.execute(deleteByEmail, [examId]);
    if (!result2)
        throw new custom_error_1.default('Delete from Private-Exam-Emails failed !', 500);
    if (isPrivate && allowedUsers.length > 0) {
        let query = 'insert into `Private-Exam-Emails` (`examId`,`email`) values ';
        let queryArray = [];
        allowedUsers.map((allowedUserEmail) => {
            queryArray.push(`('` + examId + `','` + allowedUserEmail + `')`);
        });
        queryArray = queryArray.join(',');
        let result3 = yield db.execute(query + queryArray);
        if (!result3)
            throw new custom_error_1.default('Failed to update Private User in Private-Exam-Email table', 500);
    }
    // destroyScheduler(examId + 'start');
    // destroyScheduler(examId + 'end');
    // scheduleExam(examId, date, duration);
    return res.status(200).json((0, response_handler_1.SuccessResponse)({}, 'Exam Updated!'));
}));
exports.registerInExam = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e;
    const db = (0, dbConnection_1.getDb)();
    let query;
    const { examId } = req.body;
    const userId = (_d = req.user) === null || _d === void 0 ? void 0 : _d.id;
    const email = (_e = req.user) === null || _e === void 0 ? void 0 : _e.email;
    //check if the ids are valid then insert in exam-participants table
    query =
        'select isPrivate,userId as creatorId,count(*) as examExists,finished,startTime,duration from `Exam` where `id`=? limit 1';
    let [rows] = yield db.execute(query, [examId]);
    // console.log(rows);
    let { isPrivate, creatorId, examExists, finished, startTime, duration } = rows[0];
    if (!examExists)
        throw new custom_error_1.default('Exam not Found', 500);
    if (creatorId === userId)
        throw new custom_error_1.default('Creator cannot give Exam !', 500);
    const currTime = new Date().getTime();
    if (currTime >= startTime && currTime <= startTime + duration + 120000)
        throw new custom_error_1.default('Not a valid time to register! Let the evaluation finish!', 500);
    if (isPrivate) {
        query =
            'select count(*) as userAllowed from `Private-Exam-Emails` where `email`=? limit 1';
        let [rows] = yield db.execute(query, [email]);
        //console.log(rows);
        if (!rows[0].userAllowed)
            throw new custom_error_1.default('Not allowed to enter !', 404);
    }
    query =
        'select count(*) as alreadyRegistered from `Exam-Participants` where `participantId`=? and `examId`=? limit 1';
    [rows] = yield db.execute(query, [userId, examId]);
    if (rows[0].alreadyRegistered)
        throw new custom_error_1.default('User already Registered !', 500);
    query =
        'insert into `Exam-Participants` (`examId`,`participantId`,`virtual`) values(?,?,?)';
    let result = yield db.execute(query, [examId, userId, finished]);
    if (!result)
        throw new custom_error_1.default('Registering failed !', 500);
    res.status(200).send('Successfully Registered !');
}));
exports.startExam = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _f;
    const db = (0, dbConnection_1.getDb)();
    const examId = req.params.id;
    const userId = (_f = req.user) === null || _f === void 0 ? void 0 : _f.id;
    let query = 'select * from `Exam` where `id`=? limit 1';
    let [examRows] = yield db.execute(query, [examId]);
    if (examRows.length != 1)
        throw new custom_error_1.default('Exam not found !', 500);
    examRows[0] = (0, examFunctions_1.parseExam)(examRows[0]);
    (0, examFunctions_1.shuffleExam)(examRows[0]);
    (0, examFunctions_1.removeCorrectOptions)(examRows[0]);
    query =
        'select count(*) as userRegistered,virtual,answers from `Exam-Participants` where `participantId`=? and `examId`=? limit 1';
    let [rows] = yield db.execute(query, [userId, examId]);
    console.log(rows);
    if (!rows[0].userRegistered)
        throw new custom_error_1.default('User not yet Registered !', 500);
    if (rows[0].answers)
        throw new custom_error_1.default('Answers already Submitted!', 500);
    if (rows[0].virtual)
        return res
            .status(200)
            .json((0, response_handler_1.SuccessResponse)(examRows[0], 'Virtual Exam Started !'));
    if (!examRows[0].ongoing)
        throw new custom_error_1.default('Exam has not started yet !', 500);
    //console.log(shuffleExam(examRows[0]));
    res.status(200).json((0, response_handler_1.SuccessResponse)(examRows[0], 'Exam Started !'));
}));
exports.submitExam = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _g;
    const db = (0, dbConnection_1.getDb)();
    let query;
    const { answers, finishTime, examId } = req.body;
    const participantId = (_g = req.user) === null || _g === void 0 ? void 0 : _g.id;
    if (!answers || !finishTime || !participantId || !examId)
        throw new custom_error_1.default('Fields are missing !', 500);
    query =
        'select `startTime`+`duration` as `endTime` from `Exam` where `id`=? limit 1';
    let [rows] = yield db.execute(query, [examId]);
    if (rows.length != 1)
        throw new custom_error_1.default('Exam not found!', 500);
    if (finishTime > rows[0].endTime + 15000)
        //extra 15secs
        throw new custom_error_1.default('Not a valid time to submit! Exam Finished!', 500);
    query =
        'update `Exam-Participants` set `answers`=? , `finishTime`=? where  `participantId`=?  and `examId`=?';
    [rows] = yield db.execute(query, [
        JSON.stringify(answers),
        finishTime,
        participantId,
        examId,
    ]);
    if (!rows.affectedRows)
        throw new custom_error_1.default('Error occured while submitting! :(', 500);
    res
        .status(200)
        .json((0, response_handler_1.SuccessResponse)(rows[0], 'Exam Submitted Successfully!'));
}));
exports.forceEvaluateExam = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    yield (0, examFunctions_1.evaluateExam)(id);
    res.status(200).send('Evaluation Completed!');
}));
exports.getTags = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tags = [
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
    res.status(200).json((0, response_handler_1.SuccessResponse)(tags, 'The tags are :'));
}));
exports.getQuestionTypes = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const questionTypes = [
        'mcq',
        'multipleOptions',
        'fillInTheBlanks',
    ];
    res
        .status(200)
        .json((0, response_handler_1.SuccessResponse)(questionTypes, 'The question types are :'));
}));
exports.examRegisterStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _h;
    const db = (0, dbConnection_1.getDb)();
    const userId = (_h = req.user) === null || _h === void 0 ? void 0 : _h.id;
    const examId = req.query.examId;
    let query = 'select count(*) registered from `Exam-Participants` where `examId`=? and `participantId`=?';
    const [rows] = yield db.execute(query, [examId, userId]);
    res
        .status(200)
        .json((0, response_handler_1.SuccessResponse)({ registered: rows[0].registered }, 'Register status of the user is:'));
}));
//this route uses customized question object for algorithm purposes!
exports.getExamSolution = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _j;
    const db = (0, dbConnection_1.getDb)();
    const examId = req.query.examId;
    const userId = (_j = req.user) === null || _j === void 0 ? void 0 : _j.id;
    let examQuestions;
    let query = 'select questions,finished from `Exam` where `id`=? limit 1';
    let [rows] = yield db.execute(query, [examId]);
    if (rows.length != 1)
        throw new custom_error_1.default('Exam not found!', 500);
    if (!rows[0].finished)
        res.status(200).json((0, response_handler_1.SuccessResponse)(null, 'Exam not yet finished!'));
    examQuestions = JSON.parse(rows[0].questions);
    let questionsObj = {};
    examQuestions.map((question) => {
        questionsObj[question.id] = question;
    });
    examQuestions = questionsObj;
    query =
        'select answers from `Exam-Participants` where `participantId`=? and `examId`=? limit 1';
    [rows] = yield db.execute(query, [userId, examId]);
    if (rows.length != 1)
        res
            .status(200)
            .json((0, response_handler_1.SuccessResponse)(null, 'Error while finding answers!, maybe user not registered!'));
    if (!rows[0].answers)
        res.status(200).json((0, response_handler_1.SuccessResponse)(null, 'Answers null!'));
    let answers = JSON.parse(rows[0].answers);
    let examWithUserAns = (0, examFunctions_1.getExamWithUserAns)(examQuestions, answers);
    res
        .status(200)
        .json((0, response_handler_1.SuccessResponse)(examWithUserAns, 'Your solution is :'));
}));
exports.getExamScores = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _k;
    const db = (0, dbConnection_1.getDb)();
    let query, rows;
    const userId = (_k = req.user) === null || _k === void 0 ? void 0 : _k.id;
    const examId = req.query.examId;
    query = 'select `finished` from `Exam` where `id`=? limit 1';
    [rows] = yield db.execute(query, [examId]);
    if (rows.length != 1)
        throw new custom_error_1.default('Exam not found!', 500);
    if (!rows[0].finished)
        throw new custom_error_1.default('Exam not finished !', 500);
    query =
        "select `participantId`, `rank`, `finishTime`, `totalScore`, (SELECT JSON_ARRAYAGG(JSON_OBJECT('participantId', ep.participantId, 'totalScore', ep.totalScore, 'rank', ep.rank, 'finishTime', ep.finishTime, 'name', u.name)) FROM `Exam-Participants` AS ep, `User` AS u WHERE ep.participantId = u.id AND ep.examId = e.examId ORDER BY ep.rank LIMIT 3) AS `topPerformers` from `Exam-Participants` AS e where `participantId`=? and `examId`=? LIMIT 1";
    [rows] = yield db.execute(query, [userId, examId]);
    if (rows.length != 1)
        throw new custom_error_1.default('Data not found!', 500);
    rows[0].topPerformers = JSON.parse(rows[0].topPerformers);
    res.status(200).json((0, response_handler_1.SuccessResponse)(rows[0], 'The data is : '));
}));
