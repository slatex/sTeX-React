import { getOuterHTML } from 'domutils';

export const DEFAULT_BASE_URL = 'https://mmt.beta.vollki.kwarc.info';
export const BG_COLOR = 'hsl(210, 20%, 98%)';

export interface SectionInfo {
  url: string;
  archive?: string;
  filepath?: string;
  source?: string;
}

export function convertToPlain(html: any) {
  // Create a new div element
  const tempDivElement = document.createElement('div');
  // Set the HTML content with the given value
  tempDivElement.innerHTML = getOuterHTML(html);
  // Retrieve the text property of the element
  return tempDivElement.textContent || tempDivElement.innerText || '';
}

export function getSectionInfo(url: string): SectionInfo {
  const match = /archive=([^&]+)&filepath=(.+)/g.exec(url);
  const archive = match?.[1] || '';
  const filepath = match?.[2] || '';
  const sourcePath = filepath.replace('xhtml', 'tex');
  const source = `https://gl.mathhub.info/${archive}/-/blob/main/source/${sourcePath}`;
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
