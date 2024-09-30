export interface AdminHomework {
  homeworkId: number;
  homeworkName: string;
  homeworkDate: string;
  courseId: string;
  courseInstance: string;
  archive: string;
  filepath: string;
}

export interface UserHomework {
  name: string;
  date: string;
  maxPoints: number;
  myScore: number;
  avgScore: number;
  archive: string;
  filepath: string;
}
