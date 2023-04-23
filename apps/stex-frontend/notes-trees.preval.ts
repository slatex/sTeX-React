import axios from 'axios';
import preval from 'next-plugin-preval';
import * as htmlparser2 from 'htmlparser2';
import { getOuterHTML } from 'domutils';
import { PREVALUATED_COURSE_TREES } from './course_info/prevaluated-course-trees';
import { exit } from 'process';

export const SCRIPT_MMT_URL = 'https://stexmmt.mathhub.info';
export const COURSE_ROOTS = {
  'ai-1': '/:sTeX/document?archive=MiKoMH/AI&filepath=course/notes/notes1.xhtml',
  'ai-2': '/:sTeX/document?archive=MiKoMH/AI&filepath=course/notes/notes2.xhtml',
  'iwgs-1': '/:sTeX/document?archive=MiKoMH/IWGS&filepath=course/notes/notes-part1.xhtml',
  'iwgs-2': '/:sTeX/document?archive=MiKoMH/IWGS&filepath=course/notes/notes-part2.xhtml',
  lbs: '/:sTeX/document?archive=MiKoMH/LBS&filepath=course/notes/notes.xhtml',
  krmt: '/:sTeX/document?archive=MiKoMH/KRMT&filepath=course/notes/notes.xhtml',
};
const fromPrevaluated = false;

export interface TreeNode {
  parent?: TreeNode; // Can't be filled during preval.
  titleAsHtml: string;
  children: TreeNode[];

  archive: string;
  filepath: string;
  level: number;
  endsSection: boolean; // Will always be false when returned from this script.
}

export function archiveAndFilepathFromUrl(url: string) {
  const match = /archive=([^&]+)&filepath=(.+)/g.exec(url);
  const archive = match?.[1] || '';
  const filepath = match?.[2] || '';
  return { archive, filepath };
}

async function delay(timeMs: number) {
  return new Promise((resolve) => setTimeout(resolve, timeMs));
}

function syncDelay(timeMs: number) {
  const startTime  = Date.now();
  while(Date.now() - startTime < timeMs) { /* empty */ }
}

function getChildNodesOfDocNode(
  node: any,
  level: number
): TreeNode[] {
  const embedUrl = node.attribs?.['data-inputref-url'];
  if (embedUrl) {
    delete node.attribs['data-inputref-url'];
    if (node.attribs['class']) delete node.attribs['class'];
    let titleAsHtml = getOuterHTML(node);
    if (titleAsHtml?.length > 4000) {
      // Sometimes there can be image pixel data directly in 'src' of the
      // embedded img which makes this too long.
      titleAsHtml = titleAsHtml.replace(/data:image\/jpg[^"]*/gi, '');
    }
    const childNode = getDocumentTree(embedUrl, level + 1, titleAsHtml);
    return [childNode];
  }
  const nodes: TreeNode[] = [];
  const children = node.childNodes || node.children || [];
  for (const child of children) {
    nodes.push(...getChildNodesOfDocNode(child, level));
  }
  return nodes;
}

function printTree(node: TreeNode, level = 1) {
  const noNewLines = node.titleAsHtml?.replace(/\n/g, '');
  let line =
    '.'.repeat(level) +
    `||${node.archive}||${node.filepath}||${noNewLines || ''}\n`;
  for (const c of node.children) line += printTree(c, level + 1);
  return line;
}

function createNode(parents: TreeNode[], line: string): TreeNode {
  const parts = line.split('||');
  const level = parts[0].length - 1;
  if (level < 0) console.error(`Error: [${line}]`);
  while (parents.length > level) parents.pop();

  const parent = parents.length ? parents[parents.length - 1] : null;
  const n: TreeNode = {
    children: [],
    level,
    archive: parts[1],
    filepath: parts[2],
    titleAsHtml: parts[3],
    endsSection: false,
  };
  parent?.children.push(n);
  parents.push(n);
  return n;
}

let fetchedDocs = 0;
let requestedDocs = 0;
const startTime = Date.now();
let printTime = Date.now();
const cachedDocs = new Map<string, string>();
export async function fetchDocument(url: string) {
  const cached = cachedDocs.get(url);
  if(cached) return cached;

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
  if(cached) return cached;
  console.log(`${url} not cached`);
  exit(0);
}

export async function preFetchDescendentsOfDoc(docUrl: string): Promise<void> {
  const docContent = await fetchDocument(`${SCRIPT_MMT_URL}${docUrl}`);
  // DOMParser is not available on nodejs.
  const htmlDoc = htmlparser2.parseDocument(docContent);
  await preFetchDescendentsOfDocNode(htmlDoc);
}

async function preFetchDescendentsOfDocNode(node: any): Promise<void> {
  const embedUrl = node.attribs?.['data-inputref-url'];
  if (embedUrl) {
    await preFetchDescendentsOfDoc(embedUrl);
    return;
  }
  const children = node.childNodes || node.children || [];
  const childNodesPromiseList: Promise<void>[] = [];
  for (const child of children) {
    childNodesPromiseList.push(preFetchDescendentsOfDocNode(child));
  }
  await Promise.all(childNodesPromiseList);
}


function getDocumentTree(
  docUrl: string,
  level: number,
  titleAsHtml = ''
): TreeNode {
  const fullUrl = `${SCRIPT_MMT_URL}${docUrl}`;
  const docContent = fetchDocumentCached(fullUrl);
  const { archive, filepath } = archiveAndFilepathFromUrl(docUrl);

  // DOMParser is not available on nodejs.
  const htmlDoc = htmlparser2.parseDocument(docContent);
  const children = getChildNodesOfDocNode(htmlDoc, level);

  const node = {
    titleAsHtml,
    children,
    level,
    archive,
    filepath,
    endsSection: false,
  };
  return node;
}

async function getCourseTrees() {
  const trees = {};
  if (fromPrevaluated) {
    for (const [id, preval] of Object.entries(PREVALUATED_COURSE_TREES)) {
      let root = null;
      const parents = [];
      for (const line of preval.split('\n')) {
        const n = createNode(parents, line);
        if (!root) root = n;
      }
      trees[id] = root;
    }
    return trees;
  }

  console.log(`\n\n\nGetting courseTrees from ${SCRIPT_MMT_URL}\n\n\n`);
  const docTrees = {};
  for (const [courseId, courseRoot] of Object.entries(COURSE_ROOTS)) {
    await preFetchDescendentsOfDoc(courseRoot)
    const docTree = getDocumentTree(courseRoot, 0);
    trees[courseId] = docTree;
    const printedTree = printTree(docTree);
    console.log(`${courseId} tree:\n`);
    console.log(printTree(docTree));
    docTrees[courseId] = printedTree;
  }

  console.log(`export const PREVALUATED_COURSE_TREES = {`);
  for (const courseId of Object.keys(COURSE_ROOTS)) {
    const printedTree = docTrees[courseId];
    console.log(
      `'${courseId}': ` + '`' + (printedTree as string).trim() + '`, \n'
    );
  }
  console.log(`};`);
  return trees;
}

export default preval(getCourseTrees());
