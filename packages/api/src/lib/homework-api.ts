import axios from 'axios';
import { getAuthHeaders } from './lms';
import { CreateHomeworkRequest, HomeworkInfo, UpdateHomeworkRequest } from './homework';

export async function getHomeworkList(courseId: string) {
  const resp = await axios.get(`/api/homework/get-homework/?courseId=${courseId}`, {
    headers: getAuthHeaders(),
  });
  return resp.data as HomeworkInfo[];
}

export async function createHomework(data: CreateHomeworkRequest) {
  return axios.post('/api/homework/create-homework', data, {
    headers: getAuthHeaders(),
  });
}

export async function updateHomework(data: UpdateHomeworkRequest) {
  return axios.post('/api/homework/update-homework', data, {
    headers: getAuthHeaders(),
  });
}

export async function deleteHomework(homeworkId: number, courseId: string) {
  const response = await axios.post(
    '/api/homework/delete-homework',
    { homeworkId, courseId },
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
}
