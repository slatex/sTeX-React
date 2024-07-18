import { FileLocation } from '@stex-react/utils';

export const MODERATORS = [
  'yp70uzyj', // Michael
  'yn06uhoc', // Jonas
  'ub59asib', // Dominic
  'do45qahi', // Dennis
  'ym23eqaw', // Abhishek
  'co39hywa', // Florian
  'yp68abes', // Marc
  'oc45ujef', // Florian Guthmann
  'bu93bufa', // Robert Kurin
  'iv93baik', // Mahdi Mantash
  'fy98ticu', // Marcel Schutz

  ...(process.env['NEXT_PUBLIC_SITE_VERSION'] !== 'production'
    ? ['fake_joy']
    : []), // fake moderator for staging
];

export enum HiddenStatus {
  UNHIDDEN = 'UNHIDDEN',
  SPAM = 'SPAM',
  INCORRECT = 'INCORRECT',
  IRRELEVANT = 'IRRELEVANT',
  ABUSE = 'ABUSE',
  OTHER = 'OTHER',
}

export enum CommentType {
  QUESTION = 'QUESTION',
  REMARK = 'REMARK',
  OTHER = 'OTHER',
}

export enum QuestionStatus {
  UNANSWERED = 'UNANSWERED',
  ANSWERED = 'ANSWERED',
  ACCEPTED = 'ACCEPTED',
  OTHER = 'OTHER',
}

export interface Comment {
  commentId: number;
  archive?: string;
  filepath?: string;
  parentCommentId?: number;
  threadId?: number;
  courseId?: string;
  courseTerm?: string;
  selectedText?: string;

  statement?: string;

  isEdited?: boolean;
  isPrivate: boolean;
  isDeleted?: boolean;

  hiddenStatus?: HiddenStatus;
  hiddenJustification?: string;

  commentType?: CommentType;
  questionStatus?: QuestionStatus;

  isAnonymous: boolean;
  userId?: string;
  userName?: string;
  userEmail?: string;

  totalPoints?: number;
  pointsGranted?: number;

  postedTimestampSec?: number;
  updatedTimestampSec?: number;

  childComments?: Comment[];
  // TODO: Someway to specify location in the doc.
}

export function isHiddenNotSpam(status?: HiddenStatus) {
  return (
    !!status && ![HiddenStatus.UNHIDDEN, HiddenStatus.SPAM].includes(status)
  );
}
export function isSpam(status?: HiddenStatus) {
  return status === HiddenStatus.SPAM;
}

export interface GetCommentsRequest {
  files: FileLocation[];
}

export interface EditCommentRequest {
  commentId: number;
  statement: string;
}

export interface UpdateCommentStateRequest {
  commentId: number;
  hiddenStatus: HiddenStatus;
  hiddenJustification: string;
}

export interface UpdateQuestionStateRequest {
  commentId: number;
  questionStatus?: QuestionStatus;
  commentType: CommentType;
}

export interface UserInformation {
  showTrafficLight: boolean;
  showSectionReview: boolean;
  notificationSeenTs: number;
  isVerified: boolean;
}

export interface UserSignUpDetail {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  verificationToken: string;
}

export function isModerator(userId?: string) {
  return !!userId && MODERATORS.includes(userId);
}

export enum AuthProvider {
  EMAIL_PASSWORD = 'EMAIL_PASSWORD',
  FAU_IDM = 'FAU_IDM',
}

export interface BlogPost {
  title: string;
  body: string;
  authorId: string;
  postId: string;
  createdAt: string;
  updatedAt: string;
  authorName: string;
}

export interface PostSnippet {
  postId: string;
  title: string;
  bodySnippet: string;
  authorName: string;
  createdAt: string;
}
