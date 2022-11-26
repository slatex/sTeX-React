import axios, { AxiosError } from 'axios';
import { deleteCookie, getCookie } from '@stex-react/utils';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const lmsServerAddress = process.env.NEXT_PUBLIC_LMS_URL;
export interface LMSEvent {
  type: 'i-know' | 'question-answered';
  URI: string; // The uri that "i-know" or the question answered filename.
  answers?: any; // The answer of the question. Type TBD.
}

export interface UserInfo {
  userId: string;
  givenName: string;
  sn: string;
  fullName: string;
}

export function getAccessToken() {
  return getCookie('access_token');
}

export function isLoggedIn() {
  return !!getAccessToken();
}

export function logout() {
  deleteCookie('access_token');
  location.reload();
}

export function logoutAndGetToLoginPage() {
  deleteCookie('access_token');
  const redirectUrl = `/login?target=${encodeURIComponent(
    window.location.href
  )}`;
  window.location.replace(redirectUrl);
}

export function login() {
  deleteCookie('access_token');
  location.reload();
}

export function getAuthHeaders() {
  const token = getAccessToken();
  if (!token) return undefined;
  return { Authorization: 'JWT ' + token };
}

export function loginUsingRedirect(returnBackUrl?: string) {
  if (!returnBackUrl) returnBackUrl = window.location.href;

  const redirectUrl = `${lmsServerAddress}/login?target=${encodeURIComponent(
    returnBackUrl
  )}`;

  window.location.replace(redirectUrl);
}

export function fakeLoginUsingRedirect(fakeId: string, returnBackUrl?: string) {
  if (!returnBackUrl) returnBackUrl = window.location.href;
  fakeId = fakeId.replace(/\W/g, '');

  const redirectUrl = `${lmsServerAddress}/fake-login?fake-id=${fakeId}&target=${encodeURIComponent(
    returnBackUrl
  )}`;

  window.location.replace(redirectUrl);
}

async function lmsRequest(
  apiUrl: string,
  requestType: string,
  defaultVal: any,
  data?: any
) {
  const headers = getAuthHeaders();
  if (!headers) {
    return Promise.resolve(defaultVal);
  }
  try {
    const fullUrl = `${lmsServerAddress}/${apiUrl}`;
    const resp =
      requestType === 'POST'
        ? await axios.post(fullUrl, data, { headers })
        : await axios.get(fullUrl, { headers });
    return resp.data;
  } catch (err) {
    const error = err as Error | AxiosError;
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        logoutAndGetToLoginPage();
      }
    }
  }
}

export async function getUriWeights(URIs: string[]) {
  const resp = await lmsRequest('lms/output/multiple', 'POST', null, { URIs });
  if (!resp?.competencies) return new Array(URIs.length).fill(0);
  const compMap = new Map<string, any>();
  resp.competencies.forEach((c: any) => compMap.set(c.URI, c.competence));
  return URIs.map((URI) => +(compMap.get(URI) || 0));
}

export async function reportEvent(event: LMSEvent) {
  return await lmsRequest('lms/input/events', 'POST', {}, event);
}

export async function getAllMyData() {
  return await lmsRequest('/lms/output/all_my_data', 'POST', {}, {});
}

export async function purgeAllMyData() {
  return await lmsRequest(
    '/lms/output/all_my_data',
    'POST',
    {},
    { type: 'purge' }
  );
}

let cachedUserInfo: UserInfo | undefined = undefined;
export async function getUserInfo() {
  if (!cachedUserInfo) {
    const v = await lmsRequest('getuserinfo', 'GET', undefined);
    cachedUserInfo = {
      userId: v['user_id'],
      givenName: v['given_name'],
      sn: v['sn'],
      fullName: `${v['given_name']} ${v['sn']}`,
    };
  }
  return cachedUserInfo;
}
