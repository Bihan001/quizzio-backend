import scheduler from 'node-schedule';
import { getDb } from '../database/dbConnection';
import {
  participantDataInterface,
  answerInterface,
  answersObjInterface,
} from './CustomInterfaces/ParticipantDataInterfaces';
import { examInterface } from './CustomInterfaces/ExamInterface';
import { evaluateQuestion } from './questionFunctions';

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

export const scheduleExam = (id: String, date: number, duration: number) => {
  //date = new Date(date);
  scheduler.scheduleJob(id + 'start', new Date(date), () => {
    startExam(id);
    destroyScheduler(id + 'start');
  });

  scheduler.scheduleJob(id + 'end', new Date(date + duration), () => {
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
): Number => {
  console.log(participantAnswers, ' ', examData.questions);
  let totalScore = 0;
  Object.keys(participantAnswers).map((key) => {
    let answer = participantAnswers[key];
    let question = examData.questions[key];
    if (!question || !answer) totalScore += 0;
    else {
      totalScore += evaluateQuestion[question.type](question, answer);
    }
  });
  return totalScore;
};

// Note : Evaluate exam modifies question data from arrays to hashmaps for algorithim purposes!
export const evaluateExam = async (
  id: String | undefined
): Promise<boolean> => {
  const db = getDb();
  let query;
  query = 'select * from `Exam` where id=? limit 1';
  const [examRows] = await db.execute(query, [id]);
  if (!examRows) return false;
  let examData: examInterface = parseExam(examRows[0]);
  let questionsObj: any = {};
  examData.questions.map((question: any) => {
    questionsObj[question.id] = question;
  });
  examData.questions = questionsObj;
  query = 'select * from `Exam-Participants` where `examId`=?';
  const [participantRows] = await db.execute(query, [id]);
  if (participantRows.length > 0) {
    let updateQuery = 'update `Exam-Participants` set `totalScore`= (case ';
    participantRows.map((data: participantDataInterface) => {
      let participantAnswers: answersObjInterface = JSON.parse(
        data.answers || '{}'
      );
      let totalScore: Number = evaluateParticipantData(
        examData,
        participantAnswers
      );
      updateQuery +=
        " when `participantId`='" + data.participantId + "' then " + totalScore;
      console.log(data.participantId, ' got : ', totalScore);
    });
    updateQuery += " end) where `examId`='" + id + "';";
    let [rows] = await db.execute(updateQuery);
    if (!rows.affectedRows) return false;
  }
  query = 'update `Exam` set `ongoing`=?,`finished`=? where `id`=?';
  await db.execute(query, [false, true, id]);
  return true;
};
