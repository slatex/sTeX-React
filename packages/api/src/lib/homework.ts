export interface HomeworkInfo {
  homeworkId: number;
  homeworkName: string;
  homeworkGivenDate: string;
  answerReleaseDate: string;
  courseId: string;
  courseInstance: string;
  archive: string;
  filepath: string;
}

export interface LearnerHomeworkInfo {
  name: string;
  homeworkGivenDate: string;
  answerReleaseDate: string;
  maxPoints: number;
  myScore: number;
  avgScore: number;
  archive: string;
  filepath: string;
}

export type CreateHomeworkRequest = Omit<HomeworkInfo, 'homeworkId'>;
export type UpdateHomeworkRequest = HomeworkInfo;
