import { evaluateQuestion } from '../questionFunctions';

interface questionInterface {
  id: string;
  question: string;
  marks: Number;
  negMarks: Number;
}

export interface mcqInterface extends questionInterface {
  type: 'mcq';
  correctOption: Number[];
  options: [
    {
      id: Number;
      data: string;
    }
  ];
}

export interface multipleOptionsInterface extends questionInterface {
  type: 'multipleOptions';
  correctOption: Number[];
  options: [
    {
      id: Number;
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
