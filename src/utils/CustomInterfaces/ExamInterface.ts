export interface examInterface {
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
