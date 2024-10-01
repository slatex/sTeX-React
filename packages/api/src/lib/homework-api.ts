import axios from 'axios';
import { getAuthHeaders } from './lms';
import { HomeworkInfo } from './homework';

export async function getHomeworkList(courseId: string) {
  const resp = await axios.get(`/api/homework/get-homework/?courseId=${courseId}`, {
    headers: getAuthHeaders(),
  });
  return resp.data as HomeworkInfo[];
}

export async function createHomework(data: any) {
  return axios.post('/api/homework/create-homework', data, {
    headers: getAuthHeaders(),
  });
}

export async function updateHomework(data: any) {
  return axios.put('/api/homework/update-homework', data, {
    headers: getAuthHeaders(),
  });
}

export async function deleteHomework(homeworkId: number) {
  const response = await axios.delete('/api/homework/delete-homework', {
    data: { homeworkId },
    headers: getAuthHeaders(),
  });
  return response.data;
}
