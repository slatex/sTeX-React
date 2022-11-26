import { getOuterHTML } from 'domutils';

export const BG_COLOR = 'hsl(210, 20%, 98%)';
export const IS_SERVER = typeof window === 'undefined';
export const localStore = IS_SERVER ? undefined : localStorage;
export const Window = IS_SERVER ? undefined : window;
export const IS_MMT_VIEWER = IS_SERVER
  ? false
  : (window as any).SHOW_FILE_BROWSER !== undefined;

export function shouldUseDrawer(windowWidth?: number) {
  if (!windowWidth) windowWidth = Window?.innerWidth;
  return windowWidth ? windowWidth < 800 : true;
}

export interface SectionInfo {
  url: string;
  archive?: string;
  filepath?: string;
  source?: string;
}

export function convertHtmlNodeToPlain(htmlNode: any) {
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

export function getSectionInfo(url: string): SectionInfo {
  const match = /archive=([^&]+)&filepath=(.+)/g.exec(url);
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

// Dont use this for crypto or anything serious.
export function simpleHash(str?: string) {
  if (!str?.length) return '0';
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

export function XhtmlTopDocumentContentUrl(
  projectId: string,
  xhtmlFilepath: string
) {
  return `/:sTeX/documentTop?archive=${projectId}&filepath=${xhtmlFilepath}`;
}

export function PathToArticle(projectId: string, xhtmlFilepath: string) {
  const path = `:sTeX/document?archive=${projectId}&filepath=${xhtmlFilepath}`;
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

export function fixDuplicateLabels(RAW: { label: string }[]) {
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

export function deleteCookie(name: string) {
  const EXPIRY_STRING = '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  document.cookie = name + EXPIRY_STRING;
  // HACK: In prod, the cookie can comes from 'lms.voll-ki.fau.de'. This server
  // sets the cookie to the parent domain (voll-ki.fau.de) so that any of its
  // subdomains can access it.
  document.cookie = name + `${EXPIRY_STRING} domain=voll-ki.fau.de;`;

  // For a short while cookie domain was set to 'fau.de'. This would allow those users to logout.
  document.cookie = name + `${EXPIRY_STRING} domain=fau.de;`;
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
