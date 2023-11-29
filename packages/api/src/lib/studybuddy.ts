export enum Presence {
  ONLINE = 'Online',
  OFFLINE = 'Offline',
  BOTH = 'Both',
}

export enum Languages {
  DE = 'Deutsch',
  EN = 'English',
}

export enum Days {
  MON = 'Mon',
  TUE = 'Tue',
  WEN = 'Wen',
  THU = 'Thu',
  FRI = 'Fri',
  SAT = 'Sat',
  SUN = 'Sun',
}

export interface Studybuddy {
  userId: string;
  intro: string;
  studyProgram: string;
  email: string;
  semester: number;
  presence: Presence;
  languages: Languages;
  active: boolean;
  time: string;
  courseId: string;
}

export interface StudyBuddyConnection {
  receiverId: string;
  courseId: string;
}

export interface GetAllStudyBuddiesResponse {
  courseId: string;
  connected: Studybuddy[];
  requestSent: Studybuddy[];
  requestReceived: Studybuddy[];
  other: Studybuddy[];
}
