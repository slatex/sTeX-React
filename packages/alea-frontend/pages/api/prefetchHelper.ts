import { XhtmlContentUrl, getSectionInfo } from '@stex-react/utils';
import axios from 'axios';
import * as htmlparser2 from 'htmlparser2';
import { exit } from 'process';

let fetchedDocs = 0;
let requestedDocs = 0;
const startTime = Date.now();
let printTime = Date.now();
const cachedDocs = new Map<string, string>();

function normalizeUrl(url: string) {
  const { archive, filepath } = getSectionInfo(url);
  return XhtmlContentUrl(archive, filepath);
}

async function delay(timeMs: number) {
  return new Promise((resolve) => setTimeout(resolve, timeMs));
}
export async function fetchDocument(mmtUrl: string, url: string) {
  url = normalizeUrl(url);
  const cached = cachedDocs.get(url);
  if (cached) return cached;

  const currTime = Date.now();
  if (currTime - printTime > 5000) {
    printTime = currTime;
    const elapsed = Math.round((currTime - startTime) / 1000);
    console.log(`${elapsed}s: ${fetchedDocs} of ${requestedDocs} fetched\n${url}`);
  }
  requestedDocs++;
  let docContent;
  for (let i = 0; i < 10; i++) {
    try {
      docContent = await axios.get(`${mmtUrl}/${url}`).then((r) => r.data);
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
  url = normalizeUrl(url);
  const cached = cachedDocs.get(url);
  if (cached) return cached;
  console.log(Array.from(cachedDocs.keys()).join('\n'));
  console.log(`${url} not cached`);
  exit(0);
}

export async function preFetchDescendentsOfDoc(mmtUrl: string, docUrl: string): Promise<void> {
  docUrl = normalizeUrl(docUrl);
  // console.log(`prefetching ${mmtUrl} / ${docUrl}`);
  const docContent = await fetchDocument(mmtUrl, docUrl);
  // DOMParser is not available on nodejs.
  const htmlDoc = htmlparser2.parseDocument(docContent);
  await preFetchDescendentsOfDocNode(mmtUrl, htmlDoc);
}

async function preFetchDescendentsOfDocNode(mmtUrl: string, node: any): Promise<void> {
  const embedUrl = node.attribs?.['data-inputref-url'];
  if (embedUrl) {
    await preFetchDescendentsOfDoc(mmtUrl, embedUrl);
    return;
  }
  const children = node.childNodes || node.children || [];
  const childNodesPromiseList: Promise<void>[] = [];
  for (const child of children) {
    childNodesPromiseList.push(preFetchDescendentsOfDocNode(mmtUrl, child));
  }
  await Promise.all(childNodesPromiseList);
}
