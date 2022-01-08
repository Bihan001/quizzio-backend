export interface participantDataInterface {
  id: Number;
  examId: string;
  participantId: string;
  answers: any;
  totalScore: Number | null;
  finishTime: Number;
  virtual: boolean;
}

export interface answerInterface {
  type: 'mcq' | 'multipleOptions' | 'fillInTheBlanks';
  answer: Number[] | string;
}

export interface answersObjInterface {
  [key: string]: answerInterface;
}
