import axios from 'axios';
import { getAuthHeaders } from './lms';
import { RecruiterData, StudentData } from './job-portal';

export type CreateStudentProfileRequest = StudentData & { userId: string };
export async function createStudentProfile(data: CreateStudentProfileRequest) {
  await axios.post('/api/job-portal/create-student-profile', data, {
    headers: getAuthHeaders(),
  });
}

export type CreateRecruiterProfileRequest = RecruiterData & { userId: string };
export async function createRecruiterProfile(data: CreateRecruiterProfileRequest) {
  await axios.post('/api/job-portal/create-recruiter-profile', data, {
    headers: getAuthHeaders(),
  });
}

export async function getStudentProfile() {
  const resp = await axios.get('/api/job-portal/get-student-profile', {
    headers: getAuthHeaders(),
  });
  return resp.data as StudentData;
}

export async function getRecruiterProfile() {
  const resp = await axios.get('/api/job-portal/get-recruiter-profile', {
    headers: getAuthHeaders(),
  });
  return resp.data as RecruiterData;
}

export async function checkIfUserRegisteredOnJP(userId: string) {
  const response = await axios.post('/api/job-portal/check-user-registered-on-jp', { userId });
  return response.data as { exists: boolean };
}
