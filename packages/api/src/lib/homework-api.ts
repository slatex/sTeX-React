import axios from 'axios';
import { getAuthHeaders } from './lms';
import { HomeworkData, HomeworkInfo } from './homework';

export async function getHomeworkList(courseId: string) {
  const resp = await axios.get(`/api/homework/get-homework/?courseId=${courseId}`, {
    headers: getAuthHeaders(),
  });
  return resp.data as HomeworkInfo[];
}

export async function createHomework(data: HomeworkData) {
  return axios.post('/api/homework/create-homework', data, {
    headers: getAuthHeaders(),
  });
}

export async function updateHomework(data: HomeworkData) {
  return axios.post('/api/homework/update-homework', data, {
    headers: getAuthHeaders(),
  });
}

export async function deleteHomework(homeworkId: number) {
  const response = await axios.post(
    '/api/homework/delete-homework',
    { homeworkId },
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
}
