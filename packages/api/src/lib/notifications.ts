export interface Notification {
  userId: string;
  header: string;
  content: string;
  postedTimestamp: string;
  link: string;
  notificationType: NotificationType;
}

export enum NotificationType {
  SYSTEM = 'SYSTEM',
  STUDY_BUDDY = 'STUDY_BUDDY',
  COMMENT = 'COMMENT',
}
