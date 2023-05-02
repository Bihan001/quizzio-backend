import scheduler from 'node-schedule';
import db, { getDb } from '../database/dbConnection';
import {
  participantDataInterface,
  answerInterface,
  answersObjInterface,
  participantRankingInterface,
  participantRankingData,
} from './CustomInterfaces/ParticipantDataInterfaces';
import {
  examInterface,
  RootObject,
  RootQuestionsObject,
} from './CustomInterfaces/ExamInterface';
import { evaluateQuestion } from './questionFunctions';
import CustomError from '../errors/custom-error';
import {
  fillInTheBlanksInterface,
  mcqInterface,
  multipleOptionsInterface,
} from './CustomInterfaces/QuestionInterfaces';

export const parseExam = (examObject: examInterface): examInterface => {
  examObject.tags = JSON.parse(examObject.tags);
  if (examObject.questions)
    examObject.questions = JSON.parse(examObject.questions);
  return examObject;
};

function shuffleArray(array: Array<any>) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
    if (
      array[randomIndex].type == 'mcq' ||
      array[randomIndex].type == 'multipleOptions'
    )
      array[randomIndex].options = shuffleArray(array[randomIndex].options);
    if (
      array[currentIndex].type == 'mcq' ||
      array[currentIndex].type == 'multipleOptions'
    )
      array[currentIndex].options = shuffleArray(array[currentIndex].options);
  }
  return array;
}

export const shuffleExam = (examObject: examInterface) => {
  examObject.questions = shuffleArray(examObject.questions);
  // console.log(examObject.questions);
  return examObject;
};

const getDefaultAns = (type: string) => {
  if (type == 'mcq' || type == 'multipleOptions') return [];
  return ''; //this means fillInTheBlanks type
};

export const getExamWithUserAns = (
  examQuestions: RootQuestionsObject,
  answers: answersObjInterface
) => {
  let questions = examQuestions;
  let questionsArray;
  questionsArray = Object.keys(questions).map((questionId: number | string) => {
    let answer = answers[questionId]?.answer;
    let question: RootObject = questions[questionId];
    if (!answer) answer = getDefaultAns(question.type); //this is triggered if the answer is not available then a default ans value is taken
    question.givenOption = answer;
    return question;
  });
  return questionsArray;
};

export const scheduleExam = (id: string, date: number, duration: number) => {
  //date = new Date(date);
  scheduler.scheduleJob(id + 'start', new Date(date), () => {
    startExam(id);
    destroyScheduler(id + 'start');
  });

  scheduler.scheduleJob(id + 'end', new Date(date + duration + 120000), () => {
    evaluateExam(id);
    console.log(id, ' Ended ');
    destroyScheduler(id + 'end');
  });
};

export const startExam = async (id: String) => {
  const db = getDb();
  let updateExamById = 'update `Exam` set `ongoing`=? where `id`=?';
  let result = await db.execute(updateExamById, [true, id]);
  if (result) console.log(id, ' Started !');
  else console.log(id, ' Error occured to start Exam');
};

export const scheduleOnServerRestart = async () => {
  const db = getDb();
  let query =
    'select `id`,`startTime`,`duration`  from `Exam` where `startTime`+`duration`>=?';
  let [rows] = await db.execute(query, [new Date().getTime()]);
  if (rows.length > 0) {
    console.log(rows);
    rows.map((exam: examInterface) =>
      scheduleExam(exam.id, exam.startTime, exam.duration)
    );
  } else console.log('No Exams to schedule!');
};
export const destroyScheduler = (id: any) => {
  let task = scheduler.scheduledJobs[id];
  if (task) task.cancel();
};

export const removeCorrectOptions = (examObject: examInterface) => {
  examObject.questions = [...examObject.questions].map((question) => {
    delete question['correctOption'];
    return question;
  });
};

export const evaluateParticipantData = (
  examData: examInterface,
  participantAnswers: answersObjInterface
): number => {
  // console.log(participantAnswers, ' ', examData.questions);
  let totalScore = 0;
  Object.keys(participantAnswers).map((key) => {
    let answer = participantAnswers[key];
    let question = examData.questions[key];
    if (!question || !answer || !(question.type === answer.type)) {
      console.log('error in question :', question, ' answer: ', answer);
      totalScore += 0;
    } else {
      totalScore += evaluateQuestion[question.type](question, answer);
    }
  });
  return totalScore;
};

const evaluateRanking = async (
  examId: string | undefined,
  totalRankingData: participantRankingData[]
) => {
  const db = getDb();
  totalRankingData.sort(
    (a: participantRankingInterface, b: participantRankingInterface) => {
      if (a.totalScore > b.totalScore) return -1;
      else if (b.totalScore > a.totalScore) return 1;
      else {
        let aFinishTime = a.finishTime || new Date().getTime() + 120000;
        let bFinishTime = b.finishTime || new Date().getTime() + 120000;
        return aFinishTime - bFinishTime;
      }
    }
  );
  console.log('rank sorted data is:', totalRankingData);
  let updateQuery = 'update `Exam-Participants` set `userRank`= (case ';
  totalRankingData.map(
    (rankingData: participantRankingInterface, index: number) => {
      let rank = index + 1;
      updateQuery +=
        " when `participantId`='" + rankingData.id + "' then " + rank;
    }
  );
  updateQuery += " end) where `examId`='" + examId + "';";
  const [rows] = await db.execute(updateQuery);
  if (!rows.affectedRows)
    throw new CustomError('Error while rank update!', 500);
};

// Note : Evaluate exam modifies question data from arrays to hashmaps for algorithim purposes!
export const evaluateExam = async (id: string | undefined) => {
  const db = getDb();
  let query;
  query = 'select * from `Exam` where id=? limit 1';
  const [examRows] = await db.execute(query, [id]);
  if (examRows.length != 1) throw new CustomError('Exam not found!', 500);
  let examData: examInterface = parseExam(examRows[0]);
  let questionsObj: any = {};
  examData.questions.map((question: any) => {
    questionsObj[question.id] = question;
  });
  examData.questions = questionsObj;
  query = 'select * from `Exam-Participants` where `examId`=? and `isVirtual`=?';
  const [participantRows] = await db.execute(query, [id, false]);
  if (participantRows.length > 0) {
    let totalRankingData: participantRankingInterface[] = [];
    let updateQuery = 'update `Exam-Participants` set `totalScore`= (case ';
    participantRows.map((data: participantDataInterface) => {
      let participantAnswers: answersObjInterface = JSON.parse(
        data.answers || '{}'
      );
      // console.log('xxxxxx ', participantAnswers);
      let totalScore: number = evaluateParticipantData(
        examData,
        participantAnswers
      );
      updateQuery +=
        " when `participantId`='" + data.participantId + "' then " + totalScore;
      // console.log(data.participantId, ' got : ', totalScore);
      totalRankingData.push(
        new participantRankingData(
          data.participantId,
          totalScore,
          data.finishTime
        )
      );
    });
    updateQuery += " end) where `examId`='" + id + "';";
    let [rows] = await db.execute(updateQuery);
    if (!rows.affectedRows) throw new CustomError('Score update error!', 500);
    await evaluateRanking(id, totalRankingData);
  }
  query = 'update `Exam` set `ongoing`=?,`finished`=? where `id`=?';
  await db.execute(query, [false, true, id]);
};
