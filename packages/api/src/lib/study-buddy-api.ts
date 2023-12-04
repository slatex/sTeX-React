import axios, { AxiosError } from 'axios';
import { GetStudyBuddiesResponse, StudyBuddy } from './study-buddy';
import { getAuthHeaders } from './lms';

export async function getStudyBuddyUserInfo(courseId: string) {
  try {
    const resp = await axios.get(`/api/study-buddy/get-user-info/${courseId}`, {
      headers: getAuthHeaders(),
    });
    return resp.data as StudyBuddy;
  } catch (err) {
    const error = err as Error | AxiosError;
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) return undefined;
    }
    throw err;
  }
}

export async function updateStudyBuddyInfo(courseId: string, data: StudyBuddy) {
  await axios.post(
    `/api/study-buddy/update-info/${courseId}`,
    data,
    { headers: getAuthHeaders() }
  );
}

export async function getStudyBuddyList(courseId: string) {
  const resp = await axios.get(
    `/api/study-buddy/get-study-buddies/${courseId}`,
    { headers: getAuthHeaders() }
  );
  return resp.data as GetStudyBuddiesResponse;
}

export async function setActive(courseId: string, active: boolean) {
  await axios.post(
    `/api/study-buddy/set-active/${courseId}`,
    { active },
    { headers: getAuthHeaders() }
  );
}

export async function connectionRequest(courseId: string, receiverId: string) {
  await axios.post(
    `/api/study-buddy/connection-request/${courseId}`,
    { receiverId },
    { headers: getAuthHeaders() }
  );
}

export async function removeConnectionRequest(
  courseId: string,
  receiverId: string
) {
   await axios.post(
    `/api/study-buddy/remove-connection-request/${courseId}`,
    { receiverId },
    { headers: getAuthHeaders() }
  );
}

export async function purgeStudyBuddyData() {
  const resp = await axios.post(
    `/api/study-buddy/purge-info`,
    {},
    { headers: getAuthHeaders() }
  );
  return resp.data as StudyBuddy;
}