import axios, { AxiosError } from 'axios';
import { deleteCookie, getCookie } from './utils';

const umsServerAddress =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000'
    : 'https://sp.kwarc.info';

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

function getAuthHeaders() {
  const token = getAccessToken();
  if (!token) return null;
  return { Authorization: 'JWT ' + token };
}

export function loginUsingRedirect(returnBackUrl?: string) {
  if (!returnBackUrl) returnBackUrl = window.location.href;

  const redirectUrl = `${umsServerAddress}/login?target=${encodeURIComponent(
    returnBackUrl
  )}`;

  window.location.replace(redirectUrl);
}

export function fakeLoginUsingRedirect(fakeId: string, returnBackUrl?: string) {
  if (!returnBackUrl) returnBackUrl = window.location.href;
  fakeId = fakeId.replace(/\W/g, '');

  const redirectUrl = `${umsServerAddress}/fake-login?fake-id=${fakeId}&target=${encodeURIComponent(
    returnBackUrl
  )}`;

  window.location.replace(redirectUrl);
}

async function umsRequest(
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
    const fullUrl = `${umsServerAddress}/${apiUrl}`;
    const resp =
      requestType === 'POST'
        ? await axios.post(fullUrl, data, { headers })
        : await axios.get(fullUrl, { headers });
    return resp.data;
  } catch (err) {
    const error = err as Error | AxiosError;
    if (axios.isAxiosError(error)) {
      if (error.response.status === 401) {
        logoutAndGetToLoginPage();
      }
    }
  }
}

export async function getUriWeights(uris: string[]) {
  const vals = await umsRequest(
    'usermodel/geturiweights',
    'POST',
    Array(uris.length).fill(0),
    uris
  );
  return vals.map((val) => (val ? +val : 0));
}

export async function setUriWeights(uriData: { [uri: string]: number }) {
  return await umsRequest('usermodel/seturiweights', 'POST', {}, uriData);
}

export async function getUserName() {
  return await umsRequest('getusername', 'GET', 'Not logged in');
}
