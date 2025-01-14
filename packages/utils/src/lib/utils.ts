import { getOuterHTML } from 'domutils';
import { FileLocation } from './file-location';

export const BG_COLOR = 'hsl(210, 20%, 98%)';
export const IS_SERVER = typeof window === 'undefined';
export const localStore = IS_SERVER ? undefined : localStorage;
export const Window = IS_SERVER ? undefined : window;
export const IS_MMT_VIEWER = IS_SERVER ? false : (window as any).SHOW_FILE_BROWSER !== undefined;
export const PRIMARY_COL = '#203360';
export const PRIMARY_COL_DARK_HOVER = '#162343';
export const SECONDARY_COL = '#8c9fb1';

export const MMT_CUSTOM_ID_PREFIX = '__mmt-custom-';

export function getMMTCustomId(tag: string) {
  return MMT_CUSTOM_ID_PREFIX + tag;
}

export function getCustomTag(id: string) {
  if (!id?.startsWith(MMT_CUSTOM_ID_PREFIX)) return undefined;
  return id.substring(MMT_CUSTOM_ID_PREFIX.length);
}

export function shouldUseDrawer(windowWidth?: number) {
  if (!windowWidth) windowWidth = Window?.innerWidth;
  return windowWidth ? windowWidth < 800 : true;
}

export interface FileInfo extends FileLocation {
  url: string;
  source?: string;
}

export function convertHtmlNodeToPlain(htmlNode?: any) {
  if (!htmlNode) return '';
  return convertHtmlStringToPlain(getOuterHTML(htmlNode));
}

export function convertHtmlStringToPlain(htmlStr: string) {
  if (IS_SERVER || !htmlStr) return htmlStr;
  // Create a new div element
  const tempDivElement = document.createElement('div');
  // Set the HTML content with the given value
  tempDivElement.innerHTML = htmlStr;
  // Retrieve the text property of the element
  return tempDivElement.textContent || tempDivElement.innerText || '';
}

export function getSectionInfo(url: string): FileInfo {
  if (!url) url = '';
  const match = /archive=([^&]+)&filepath=([^&]+)/g.exec(url);
  const archive = match?.[1] || '';
  const filepath = match?.[2] || '';
  const sourcePath = filepath.replace('xhtml', 'tex');
  const source = sourceFileUrl(archive, sourcePath);
  return {
    url: url.replace('/document?', '/fulldocument?'),
    archive,
    filepath,
    source,
  };
}

export function extractProjectIdAndFilepath(problemId: string, fileExtension = '.tex') {
  const url = problemId.replace('http://mathhub.info/', '').replace(/\?en.*/, '');
  const parts = url.split('/');
  const defaultProjectParts = 2;
  let projectParts;
  if (parts[0] === 'courses' || parts[0] === 'sTeX') {
    projectParts = 4;
  } else {
    projectParts = Math.min(defaultProjectParts, parts.length - 2);
  }
  const archive = parts.slice(0, projectParts).join('/');
  const filePath = parts.slice(projectParts).join('/').replace('.omdoc', fileExtension);
  return [archive, filePath];
}

export function urlWithContextParams(url: string, locale: string, topLevelUrl?: string) {
  const sectionInfo = getSectionInfo(topLevelUrl ?? '');
  if (!sectionInfo) return '';
  const { archive, filepath } = sectionInfo;
  if (url.endsWith('language=')) {
    // Horrible hack.
    return `${url}${locale}&contextArchive=${archive}&contextFilepath=${filepath}`;
  }
  return `${url}&language=${locale}&contextArchive=${archive}&contextFilepath=${filepath}`;
}

// Not crypto-safe.
export function simpleNumberHash(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
  }
  return hash;
}

// Dont use this for crypto or anything serious.
export function simpleHash(str?: string) {
  if (!str?.length) return '0';
  // return str.replace(/\W/g, ''); For debugging
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString(36);
}

export function XhtmlContentUrl(projectId: string, xhtmlFilepath: string) {
  return `/:sTeX/document?archive=${projectId}&filepath=${xhtmlFilepath}`;
}

export function fullDocumentUrl({ archive, filepath }: FileLocation) {
  return `/:sTeX/fulldocument?archive=${archive}&filepath=${filepath}`;
}

export function XhtmlTopDocumentContentUrl({ archive, filepath }: FileLocation) {
  return `/:sTeX/documentTop?archive=${archive}&filepath=${filepath}`;
}

export function PathToArticle({ archive, filepath }: FileLocation) {
  const path = `:sTeX/document?archive=${archive}&filepath=${filepath}`;
  return `/browser/${encodeURIComponent(path)}`;
}

export function PathToTour(tourId: string) {
  const encoded = encodeURIComponent(tourId);
  return `/guided-tour/${encoded}`;
}

export function texPathToXhtml(texFilepath: string) {
  return texFilepath.slice(0, -3) + 'xhtml';
}

export function xhtmlPathToTex(xhtmlFilepath: string) {
  return xhtmlFilepath.slice(0, -5) + 'tex';
}

export function sourceFileUrl(projectId: string, texFilepath: string) {
  return `https://gl.mathhub.info/${projectId}/-/blob/main/source/${texFilepath}`;
}

export function fixDuplicateLabels<T extends { label: string }>(RAW: T[]) {
  const fixed = [...RAW]; // create a copy;
  const labelToIndex = new Map<string, number[]>();
  for (const [idx, item] of fixed.entries()) {
    if (labelToIndex.has(item.label)) {
      labelToIndex.get(item.label)?.push(idx);
    } else {
      labelToIndex.set(item.label, [idx]);
    }
  }
  for (const [label, indexes] of labelToIndex.entries()) {
    if (indexes?.length <= 1) continue;
    for (const [idx, index] of indexes.entries()) {
      fixed[index].label = `${label} (${idx + 1})`;
    }
  }
  return fixed;
}

export function isFauId(userId:string):boolean{
  return userId.length===8 && !userId.includes('@');
}

export function getChildrenOfBodyNode(bodyNode: any) {
  return bodyNode?.props?.children;
}

export function getCookie(name: string) {
  if (typeof window === 'undefined') return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length !== 2) return undefined;
  return (parts.pop() as string).split(';').shift();
}

export function setCookie(name: string, value: string) {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1); // Set expiry date to one year from now
  const expiry = `; expires=${date.toUTCString()}`;
  const path = '; path=/';
  document.cookie = `${name}=${value}${expiry}${path}`;
}

export function deleteCookie(name: string) {
  const EXPIRY_STRING = '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  document.cookie = name + EXPIRY_STRING;
  // HACK: In prod, the cookie can comes from 'lms.voll-ki.fau.de'. This server
  // sets the cookie to the parent domain (voll-ki.fau.de) so that any of its
  // subdomains can access it.
  document.cookie = name + `${EXPIRY_STRING} domain=voll-ki.fau.de;`;

  // For a short while cookie domain was set to 'fau.de'. This would allow those users to logout.
  document.cookie = name + `${EXPIRY_STRING} domain=fau.de;`;

  // For staging server.
  document.cookie = name + `${EXPIRY_STRING} domain=kwarc.info;`;
}

export function downloadFile(data: any, fileName: string, fileType: string) {
  // Create a blob with the data we want to download as a file
  const blob = new Blob([data], { type: fileType });
  // Create an anchor element and dispatch a click event on it
  // to trigger a download
  const a = document.createElement('a');
  a.download = fileName;
  a.href = window.URL.createObjectURL(blob);
  const clickEvt = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true,
  });
  a.dispatchEvent(clickEvt);
  a.remove();
}

// A "stable" random function generator. Stable because we can provide it a seed.
// https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
// Stable because this always returns the same shuffle for a given array.
export function stableShuffle(array: any[]) {
  let currentIndex = array.length,
    randomIndex;

  const randomGen = mulberry32(array.length);
  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(randomGen() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
}

export function roundToMinutes(timestamp_ms: number) {
  const msInAMinute = 60000;
  return Math.round(timestamp_ms / msInAMinute) * msInAMinute;
}

export function truncateString(str: string, maxLength: number) {
  return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
}

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function chooseRandomlyFromList(list: any[]) {
  return list[Math.floor(Math.random() * list.length)];
}
