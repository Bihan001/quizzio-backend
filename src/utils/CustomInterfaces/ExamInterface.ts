export interface examInterface {
  id: string;
  userId: string;
  image: string;
  tags: string;
  questions: any;
  startTime: number;
  duration: number;
  ongoing: boolean;
  finished: boolean;
}

export interface Option {
  id: number;
  data: string;
}

export interface RootObject {
  question: string;
  type: string;
  options: Option[];
  givenOption: any;
  correctOption: any;
}

export interface RootQuestionsObject {
  [id: string]: RootObject;
}
