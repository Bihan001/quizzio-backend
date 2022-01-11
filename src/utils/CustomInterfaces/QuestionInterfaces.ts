import { evaluateQuestion } from '../questionFunctions';

interface questionInterface {
  id: string;
  question: string;
  marks: number;
  negMarks: number;
  type: string;
}

export interface mcqInterface extends questionInterface {
  correctOption: number[];
  options: [
    {
      id: number;
      data: string;
    }
  ];
}

export interface multipleOptionsInterface extends questionInterface {
  correctOption: number[];
  options: [
    {
      id: number;
      data: string;
    }
  ];
}
export interface fillInTheBlanksInterface extends questionInterface {
  correctOption: string;
}

export interface evaluateQuestionInterface {
  [type: string]: any;
}
