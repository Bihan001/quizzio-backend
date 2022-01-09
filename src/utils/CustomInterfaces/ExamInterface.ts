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
