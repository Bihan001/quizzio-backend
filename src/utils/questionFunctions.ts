import {
  mcqInterface,
  multipleOptionsInterface,
  fillInTheBlanksInterface,
  evaluateQuestionInterface,
} from './CustomInterfaces/QuestionInterfaces';
import { examInterface } from './CustomInterfaces/ExamInterface';
import { answerInterface } from './CustomInterfaces/ParticipantDataInterfaces';

const evaluateMCQ = (
  question: mcqInterface,
  answer: answerInterface
): Number => {
  if (question.correctOption[0] === answer.answer[0]) return question.marks;
  return question.negMarks;
};

const evaluateMultipleOptions = (
  question: multipleOptionsInterface,
  answer: answerInterface
): Number => {
  let participantAnsOpts = [...answer.answer].sort();
  let correctOptions = [...question.correctOption].sort();
  if (correctOptions.every((val, index) => val === participantAnsOpts[index]))
    return question.marks;
  return question.negMarks;
};

const evaluateFillInTheBlanks = (
  question: fillInTheBlanksInterface,
  answer: answerInterface
): Number => {
  return question.correctOption.toLowerCase() ===
    answer.answer.toString().toLowerCase()
    ? question.marks
    : question.negMarks;
};

export const evaluateQuestion: evaluateQuestionInterface = {
  mcq: evaluateMCQ,
  multipleOptions: evaluateMultipleOptions,
  fillInTheBlanks: evaluateFillInTheBlanks,
};
