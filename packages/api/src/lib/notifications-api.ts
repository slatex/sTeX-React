import axios from 'axios';
import { getAuthHeaders } from './lms';

export async function postNotification(
  userId: string,
  header: string,
  content: string
) {
  const url = '/api/post-notification';
  const data = { userId, header, content };

  return axios.post(url, data, {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function getUserNotifications() {
  const url = '/api/get-user-notifications';
  return axios
    .get(url, { headers: getAuthHeaders() })
    .then((response) => response.data as Notification[]);
}

export async function purgeUserNotifications() {
  const url = '/api/purge-user-notifications';
  return await axios.post(url, undefined, {
    headers: getAuthHeaders(),
  });
}