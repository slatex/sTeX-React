export enum Action {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE'
}

export function blogResourceId() {
  return '/blog';
}

export function commentResourceId(courseId: string, instance: string) {
  return `/course/${courseId}/instance/${instance}/comments`;
}
