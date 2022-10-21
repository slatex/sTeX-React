export function getCookie(name: string) {
  if (typeof window === 'undefined') return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length !== 2) return undefined;
  return (parts.pop() as string).split(';').shift();
}

export function deleteCookie(name: string) {
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  // HACK: In prod, the cookie can comes from 'lms.voll-ki.fau.de'. This server
  // sets the cookie to the parent domain (voll-ki.fau.de) so that any of its
  // subdomains can access it.
  document.cookie =
    name +
    '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; domain=voll-ki.fau.de;';
}
