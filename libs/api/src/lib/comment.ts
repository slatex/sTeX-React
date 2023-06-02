export const MODERATORS = [
  'yp70uzyj', // Michael
  'yn06uhoc', // Jonas
  'ub59asib', // Dominic
  'do45qahi', // Dennis
  'ym23eqaw', // Abhishek
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
  QUESTION= 'QUESTION',
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

export function isModerator(userId?: string) {
  return !!userId && MODERATORS.includes(userId);
}
