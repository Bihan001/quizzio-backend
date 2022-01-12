"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateQuestion = void 0;
const evaluateMCQ = (question, answer) => {
    if (question.correctOption[0] === answer.answer[0])
        return question.marks;
    return -question.negMarks;
};
const evaluateMultipleOptions = (question, answer) => {
    let participantAnsOpts = [...answer.answer].sort();
    let correctOptions = [...question.correctOption].sort();
    if (correctOptions.every((val, index) => val === participantAnsOpts[index]))
        return question.marks;
    return -question.negMarks;
};
const evaluateFillInTheBlanks = (question, answer) => {
    return question.correctOption.toLowerCase() ===
        answer.answer.toString().toLowerCase()
        ? question.marks
        : -question.negMarks;
};
exports.evaluateQuestion = {
    mcq: evaluateMCQ,
    multipleOptions: evaluateMultipleOptions,
    fillInTheBlanks: evaluateFillInTheBlanks,
};
