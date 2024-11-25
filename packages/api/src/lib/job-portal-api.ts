import axios from 'axios';
import { getAuthHeaders } from './lms';
import { RecruiterData, StudentData } from './job-portal';

export type CreateStudentProfileRequest = StudentData & { userId: string };
export async function createStudentProfile(data: CreateStudentProfileRequest) {
  const resp = await axios.post('/api/job-portal/create-student-profile', data, {
    headers: getAuthHeaders(),
  });
  return resp.data;
}

export type createRecruiterProfileRequest = RecruiterData & { userId: string };
export async function createRecruiterProfile(data: createRecruiterProfileRequest) {
  const resp = await axios.post('/api/job-portal/create-recruiter-profile', data, {
    headers: getAuthHeaders(),
  });
  return resp.data;
}

export async function getStudentProfile() {
  return axios.get('/api/job-portal/get-student-profile', {
    headers: getAuthHeaders(),
  });
}

export async function getRecruiterProfile() {
  return axios.get('/api/job-portal/get-recruiter-profile', {
    headers: getAuthHeaders(),
  });
}

export async function checkIfUserRegisteredOnJP(userId: string) {
  const response = await axios.post('/api/job-portal/check-user-registered-on-jp', { userId });
  return response.data as { exists: boolean };
}
