export enum Action {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',

  MUTATE = 'MUTATE',
}

export function blogResourceId() {
  return '/blog';
}

export function quizResourceId(courseId: string, instance: string) {
  return `/course/${courseId}/instance/${instance}/quiz`;
}

export function commentResourceId(courseId: string, instance: string) {
  return `/course/${courseId}/instance/${instance}/comments`;
}
