import scheduler from 'node-schedule';
import { getDb } from '../database/dbConnection';

interface examInterface {
  id: string;
  userId: string;
  image: string;
  tags: string;
  questions: any;
  startTime: Date;
  duration: Number;
  ongoing: boolean;
  finished: boolean;
}

export const parseExam = (examObject: examInterface): examInterface => {
  examObject.tags = JSON.parse(examObject.tags);
  if (examObject.questions) examObject.questions = JSON.parse(examObject.questions);
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
    if (array[randomIndex].type == 'mcq' || array[randomIndex].type == 'multipleOptions')
      array[randomIndex].options = shuffleArray(array[randomIndex].options);
    if (array[currentIndex].type == 'mcq' || array[currentIndex].type == 'multipleOptions')
      array[currentIndex].options = shuffleArray(array[currentIndex].options);
  }
  return array;
}

export const shuffleExam = (examObject: examInterface) => {
  examObject.questions = shuffleArray(examObject.questions);
  // console.log(examObject.questions);
  return examObject;
};

export const scheduleExam = (id: String, date: Date, duration: Number) => {
  date = new Date(date);
  scheduler.scheduleJob(id + 'start', date, () => {
    startExam(id);
    destroyScheduler(id + 'start');
  });
  date.setSeconds(date.getSeconds() + 15);
  scheduler.scheduleJob(id + 'end', date, () => {
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

export const evaluateExam = (id: String) => {
  const db = getDb();
};

export const scheduleOnServerRestart = async () => {
  const db = getDb();
  let query = 'select `id`,`startTime`,`duration`  from `Exam` where `startTime`>?';
  let [rows] = await db.execute(query, [new Date()]);
  if (rows.length > 0) {
    console.log(rows);
    rows.map((exam: examInterface) => scheduleExam(exam.id, exam.startTime, exam.duration));
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
