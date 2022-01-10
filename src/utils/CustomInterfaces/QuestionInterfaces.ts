import { evaluateQuestion } from '../questionFunctions';

interface questionInterface {
  id: string;
  question: string;
  marks: number;
  negMarks: number;
}

export interface mcqInterface extends questionInterface {
  type: 'mcq';
  correctOption: number[];
  options: [
    {
      id: number;
      data: string;
    }
  ];
}

export interface multipleOptionsInterface extends questionInterface {
  type: 'multipleOptions';
  correctOption: number[];
  options: [
    {
      id: number;
      data: string;
    }
  ];
}
export interface fillInTheBlanksInterface extends questionInterface {
  type: 'fillInTheBlanks';
  correctOption: string;
}

export interface evaluateQuestionInterface {
  [type: string]: any;
}
