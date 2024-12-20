import axios from 'axios';
import { getAuthHeaders } from './lms';
import { JobPostInfo, JobTypeInfo, OrganizationData, RecruiterData, StudentData } from './job-portal';

export async function createStudentProfile(data: StudentData) {
  await axios.post('/api/job-portal/create-student-profile', data, {
    headers: getAuthHeaders(),
  });
}
export async function upDateStudentProfile(data: StudentData) {
  await axios.post('/api/job-portal/update-student-profile', data, {
    headers: getAuthHeaders(),
  });
}
export async function createRecruiterProfile(data: RecruiterData) {
  await axios.post('/api/job-portal/create-recruiter-profile', data, {
    headers: getAuthHeaders(),
  });
}
export async function upDateRecruiterProfile(data: RecruiterData) {
  await axios.post('/api/job-portal/update-recruiter-profile', data, {
    headers: getAuthHeaders(),
  });
}

export async function getStudentProfile() {
  const resp = await axios.get('/api/job-portal/get-student-profile', {
    headers: getAuthHeaders(),
  });
  return resp.data as StudentData[];
}

export async function getRecruiterProfile() {
  const resp = await axios.get('/api/job-portal/get-recruiter-profile', {
    headers: getAuthHeaders(),
  });
  return resp.data as RecruiterData[];
}

export async function checkIfUserRegisteredOnJP(userId: string) {
  const response = await axios.post('/api/job-portal/check-user-registered-on-jp', { userId });
  return response.data as { exists: boolean };
}

export async function createOrganizationProfile(data: OrganizationData) {
  await axios.post('/api/job-portal/create-organization-profile', data, {
    headers: getAuthHeaders(),
  });
}
export async function updateOrganizationProfile(data: OrganizationData, id: number) {
  await axios.post(
    '/api/job-portal/update-organization-profile',
    { data, id },
    { headers: getAuthHeaders() }
  );
}

export async function getOrganizationProfile(id: number) {
  const resp = await axios.get('/api/job-portal/get-organization-profile', {
    headers: getAuthHeaders(),
    params: { id },
  });
  return resp.data as OrganizationData[];
}

export async function getOrganizationId(organizationName: string) {
  const resp = await axios.get('/api/job-portal/get-organization-id', {
    headers: getAuthHeaders(),
    params: { organizationName },
  });
  return resp.data as number;
}

export async function createJobType(data: any) {
  await axios.post('/api/job-portal/create-job-type', data, {
    headers: getAuthHeaders(),
  });
}

export async function updateJobType(data: JobTypeInfo) {
  await axios.post('/api/job-portal/update-job-type', data, {
    headers: getAuthHeaders(),
  });
}

export async function deleteJobType(id: number) {
  await axios.post('/api/job-portal/delete-job-type', { id }, { headers: getAuthHeaders() });
}

export async function getJobType(instanceId: string) {
  const resp = await axios.get('/api/job-portal/get-job-type', {
    headers: getAuthHeaders(),
    params: { instanceId },
  });
  return resp.data as JobTypeInfo[];
}


export async function createJobPost(data: any) {
  await axios.post('/api/job-portal/create-job-post', data, {
    headers: getAuthHeaders(),
  });
}


export async function getJobPost(organizationId: number) {
  const resp = await axios.get('/api/job-portal/get-job-post', {
    headers: getAuthHeaders(),
    params: { organizationId },
  });
  return resp.data as JobPostInfo[] ;
}
