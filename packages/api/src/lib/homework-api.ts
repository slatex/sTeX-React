import axios from 'axios';
import { getAuthHeaders } from './lms';
import { HomeworkInfo, HomeworkPhase } from './homework';
import { CURRENT_TERM } from '@stex-react/utils';

export async function getHomeworkList(courseId: string) {
  const resp = await axios.get(`/api/homework/get-homework-list?courseId=${courseId}`, {
    headers: getAuthHeaders(),
  });
  return resp.data as HomeworkInfo[];
}

export function getHomeworkPhase(homework: HomeworkInfo): HomeworkPhase {
  const now = new Date();
  if (now < new Date(homework.givenTs)) return 'NOT_GIVEN';
  if (now < new Date(homework.dueTs)) return 'GIVEN';
  if (now < new Date(homework.feedbackReleaseTs)) return 'SUBMISSION_CLOSED';
  return 'FEEDBACK_RELEASED';
}

export async function getHomeworkInfo(id: number) {
  const resp = await axios.get(`/api/homework/get-homework?id=${id}`, {
    headers: getAuthHeaders(),
  });
  return resp.data as HomeworkInfo;
}

export type CreateHomeworkRequest = Omit<HomeworkInfo, 'id' | 'updaterId'>;
export async function createHomework(data: CreateHomeworkRequest) {
  return axios.post('/api/homework/create-homework', data, {
    headers: getAuthHeaders(),
  });
}

export type UpdateHomeworkRequest = Omit<HomeworkInfo, 'courseId' | 'courseInstance' | 'updaterId'>;
export async function updateHomework(data: UpdateHomeworkRequest) {
  return axios.post('/api/homework/update-homework', data, {
    headers: getAuthHeaders(),
  });
}

export async function deleteHomework(id: number, courseId: string) {
  const response = await axios.post(
    '/api/homework/delete-homework',
    { id, courseId },
    { headers: getAuthHeaders() }
  );
  return response.data;
}
export async function getHomeworkTree(courseId: string) {
  return axios
    .get('/api/homework/get-homework-tree', {
      params: { courseId, courseInstance: CURRENT_TERM },
      headers: getAuthHeaders(),
    })
    .then((c) => c.data);
}
