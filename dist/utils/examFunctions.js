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
exports.evaluateExam = exports.evaluateParticipantData = exports.removeCorrectOptions = exports.destroyScheduler = exports.scheduleOnServerRestart = exports.startExam = exports.scheduleExam = exports.getExamWithUserAns = exports.shuffleExam = exports.parseExam = void 0;
const node_schedule_1 = __importDefault(require("node-schedule"));
const dbConnection_1 = require("../database/dbConnection");
const ParticipantDataInterfaces_1 = require("./CustomInterfaces/ParticipantDataInterfaces");
const questionFunctions_1 = require("./questionFunctions");
const custom_error_1 = __importDefault(require("../errors/custom-error"));
const parseExam = (examObject) => {
    examObject.tags = JSON.parse(examObject.tags);
    if (examObject.questions)
        examObject.questions = JSON.parse(examObject.questions);
    return examObject;
};
exports.parseExam = parseExam;
function shuffleArray(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
        if (array[randomIndex].type == 'mcq' ||
            array[randomIndex].type == 'multipleOptions')
            array[randomIndex].options = shuffleArray(array[randomIndex].options);
        if (array[currentIndex].type == 'mcq' ||
            array[currentIndex].type == 'multipleOptions')
            array[currentIndex].options = shuffleArray(array[currentIndex].options);
    }
    return array;
}
const shuffleExam = (examObject) => {
    examObject.questions = shuffleArray(examObject.questions);
    // console.log(examObject.questions);
    return examObject;
};
exports.shuffleExam = shuffleExam;
const getDefaultAns = (type) => {
    if (type == 'mcq' || type == 'multipleOptions')
        return [];
    return ''; //this means fillInTheBlanks type
};
const getExamWithUserAns = (examQuestions, answers) => {
    let questions = examQuestions;
    let questionsArray;
    questionsArray = Object.keys(questions).map((questionId) => {
        var _a;
        let answer = (_a = answers[questionId]) === null || _a === void 0 ? void 0 : _a.answer;
        let question = questions[questionId];
        if (!answer)
            answer = getDefaultAns(question.type); //this is triggered if the answer is not available then a default ans value is taken
        question.givenOption = answer;
        return question;
    });
    return questionsArray;
};
exports.getExamWithUserAns = getExamWithUserAns;
const scheduleExam = (id, date, duration) => {
    //date = new Date(date);
    node_schedule_1.default.scheduleJob(id + 'start', new Date(date), () => {
        (0, exports.startExam)(id);
        (0, exports.destroyScheduler)(id + 'start');
    });
    node_schedule_1.default.scheduleJob(id + 'end', new Date(date + duration + 120000), () => {
        (0, exports.evaluateExam)(id);
        console.log(id, ' Ended ');
        (0, exports.destroyScheduler)(id + 'end');
    });
};
exports.scheduleExam = scheduleExam;
const startExam = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const db = (0, dbConnection_1.getDb)();
    let updateExamById = 'update `Exam` set `ongoing`=? where `id`=?';
    let result = yield db.execute(updateExamById, [true, id]);
    if (result)
        console.log(id, ' Started !');
    else
        console.log(id, ' Error occured to start Exam');
});
exports.startExam = startExam;
const scheduleOnServerRestart = () => __awaiter(void 0, void 0, void 0, function* () {
    const db = (0, dbConnection_1.getDb)();
    let query = 'select `id`,`startTime`,`duration`  from `Exam` where `startTime`+`duration`>=?';
    let [rows] = yield db.execute(query, [new Date().getTime()]);
    if (rows.length > 0) {
        console.log(rows);
        rows.map((exam) => (0, exports.scheduleExam)(exam.id, exam.startTime, exam.duration));
    }
    else
        console.log('No Exams to schedule!');
});
exports.scheduleOnServerRestart = scheduleOnServerRestart;
const destroyScheduler = (id) => {
    let task = node_schedule_1.default.scheduledJobs[id];
    if (task)
        task.cancel();
};
exports.destroyScheduler = destroyScheduler;
const removeCorrectOptions = (examObject) => {
    examObject.questions = [...examObject.questions].map((question) => {
        delete question['correctOption'];
        return question;
    });
};
exports.removeCorrectOptions = removeCorrectOptions;
const evaluateParticipantData = (examData, participantAnswers) => {
    // console.log(participantAnswers, ' ', examData.questions);
    let totalScore = 0;
    Object.keys(participantAnswers).map((key) => {
        let answer = participantAnswers[key];
        let question = examData.questions[key];
        if (!question || !answer || !(question.type === answer.type)) {
            console.log('error in question :', question, ' answer: ', answer);
            totalScore += 0;
        }
        else {
            totalScore += questionFunctions_1.evaluateQuestion[question.type](question, answer);
        }
    });
    return totalScore;
};
exports.evaluateParticipantData = evaluateParticipantData;
const evaluateRanking = (examId, totalRankingData) => __awaiter(void 0, void 0, void 0, function* () {
    const db = (0, dbConnection_1.getDb)();
    totalRankingData.sort((a, b) => {
        if (a.totalScore > b.totalScore)
            return -1;
        else if (b.totalScore > a.totalScore)
            return 1;
        else {
            let aFinishTime = a.finishTime || new Date().getTime() + 120000;
            let bFinishTime = b.finishTime || new Date().getTime() + 120000;
            return aFinishTime - bFinishTime;
        }
    });
    console.log('rank sorted data is:', totalRankingData);
    let updateQuery = 'update `Exam-Participants` set `rank`= (case ';
    totalRankingData.map((rankingData, index) => {
        let rank = index + 1;
        updateQuery +=
            " when `participantId`='" + rankingData.id + "' then " + rank;
    });
    updateQuery += " end) where `examId`='" + examId + "';";
    const [rows] = yield db.execute(updateQuery);
    if (!rows.affectedRows)
        throw new custom_error_1.default('Error while rank update!', 500);
});
// Note : Evaluate exam modifies question data from arrays to hashmaps for algorithim purposes!
const evaluateExam = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const db = (0, dbConnection_1.getDb)();
    let query;
    query = 'select * from `Exam` where id=? limit 1';
    const [examRows] = yield db.execute(query, [id]);
    if (examRows.length != 1)
        throw new custom_error_1.default('Exam not found!', 500);
    let examData = (0, exports.parseExam)(examRows[0]);
    let questionsObj = {};
    examData.questions.map((question) => {
        questionsObj[question.id] = question;
    });
    examData.questions = questionsObj;
    query = 'select * from `Exam-Participants` where `examId`=? and `virtual`=?';
    const [participantRows] = yield db.execute(query, [id, false]);
    if (participantRows.length > 0) {
        let totalRankingData = [];
        let updateQuery = 'update `Exam-Participants` set `totalScore`= (case ';
        participantRows.map((data) => {
            let participantAnswers = JSON.parse(data.answers || '{}');
            // console.log('xxxxxx ', participantAnswers);
            let totalScore = (0, exports.evaluateParticipantData)(examData, participantAnswers);
            updateQuery +=
                " when `participantId`='" + data.participantId + "' then " + totalScore;
            // console.log(data.participantId, ' got : ', totalScore);
            totalRankingData.push(new ParticipantDataInterfaces_1.participantRankingData(data.participantId, totalScore, data.finishTime));
        });
        updateQuery += " end) where `examId`='" + id + "';";
        let [rows] = yield db.execute(updateQuery);
        if (!rows.affectedRows)
            throw new custom_error_1.default('Score update error!', 500);
        yield evaluateRanking(id, totalRankingData);
    }
    query = 'update `Exam` set `ongoing`=?,`finished`=? where `id`=?';
    yield db.execute(query, [false, true, id]);
});
exports.evaluateExam = evaluateExam;
