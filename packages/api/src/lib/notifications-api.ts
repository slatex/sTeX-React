import axios from 'axios';
import { getAuthHeaders } from './lms';
import { Notification } from './notifications';

export async function getUserNotifications(locale: string) {
  const url = `/api/get-user-notifications/${locale}`;
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
