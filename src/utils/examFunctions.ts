import scheduler from 'node-schedule';
import { getDb } from '../database/dbConnection';

interface examInterface {
  id: string;
  userId: string;
  image: string;
  tags: string;
  questions: string;
  startTime: Date;
  duration: Number;
  ongoing: boolean;
  finished: boolean;
}

export const parseExam = (examObject: examInterface): examInterface => {
  examObject.tags = JSON.parse(examObject.tags);
  examObject.questions = JSON.parse(examObject.questions);
  return examObject;
};

export const scheduleExam = (id: String, date: Date, duration: Number) => {
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
  let query =
    'select `id`,`startTime`,`duration`  from `Exam` where `startTime`>?';
  let [rows] = await db.execute(query, [new Date()]);
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
