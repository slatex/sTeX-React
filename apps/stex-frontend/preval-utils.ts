import axios from 'axios';
import { exit } from 'process';

export const SCRIPT_MMT_URL = 'https://stexmmt.mathhub.info';

export function archiveAndFilepathFromUrl(url: string) {
  const match = /archive=([^&]+)&filepath=(.+)/g.exec(url);
  const archive = match?.[1] || '';
  const filepath = match?.[2] || '';
  return { archive, filepath };
}

async function delay(timeMs: number) {
  return new Promise((resolve) => setTimeout(resolve, timeMs));
}

let fetchedDocs = 0;
let requestedDocs = 0;
const startTime = Date.now();
let printTime = Date.now();
const cachedDocs = new Map<string, string>();
export async function fetchDocument(url: string) {
  const cached = cachedDocs.get(url);
  if (cached) return cached;

  const currTime = Date.now();
  if (currTime - printTime > 5000) {
    printTime = currTime;
    const elapsed = Math.round((currTime - startTime) / 1000);
    console.log(
      `${elapsed}s: ${fetchedDocs} of ${requestedDocs} fetched\n${url}`
    );
  }
  requestedDocs++;
  let docContent;
  for (let i = 0; i < 10; i++) {
    try {
      docContent = await axios.get(url).then((r) => r.data);
      cachedDocs.set(url, docContent);
      break;
    } catch (e) {
      console.log(`\n${fetchedDocs} of ${requestedDocs} fetched`);
      console.log(`Failed ${i}:\n${url}`);
      await delay(1000 * i + Math.random() * 100);
    }
  }
  if (!docContent) {
    console.log(`Fetching failed: ${url}`);
    exit(0);
  }
  fetchedDocs++;
  return docContent;
}

export function fetchDocumentCached(url: string) {
  const cached = cachedDocs.get(url);
  if (cached) return cached;
  console.log(`${url} not cached`);
  exit(0);
}
