export interface participantDataInterface {
  id: number;
  examId: string;
  participantId: string;
  answers: any;
  totalScore: number | null;
  finishTime: number;
  virtual: boolean;
}

export interface answerInterface {
  type: 'mcq' | 'multipleOptions' | 'fillInTheBlanks';
  answer: number[] | string;
}

export interface answersObjInterface {
  [key: string]: answerInterface;
}

export interface participantRankingInterface {
  id: String;
  finishTime: number;
  totalScore: number;
}

export class participantRankingData implements participantRankingInterface {
  id: String;
  finishTime: number;
  totalScore: number;

  constructor(id: String, totalScore: number, finishTime: number) {
    this.id = id;
    this.totalScore = totalScore;
    this.finishTime = finishTime;
  }
}
