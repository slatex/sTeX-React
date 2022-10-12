import { getOuterHTML } from 'domutils';

export const DEFAULT_BASE_URL = 'https://stexmmt.mathhub.info';
export const BG_COLOR = 'hsl(210, 20%, 98%)';
export const IS_SERVER = typeof window === 'undefined';
export const localStore = IS_SERVER ? undefined : localStorage;
export const Window = IS_SERVER ? undefined : window;

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
  if (!htmlStr) return htmlStr;
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

export function XhtmlContentUrl(
  baseUrl: string,
  projectId: string,
  xhtmlFilepath: string
) {
  return `${baseUrl}/:sTeX/document?archive=${projectId}&filepath=${xhtmlFilepath}`;
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
