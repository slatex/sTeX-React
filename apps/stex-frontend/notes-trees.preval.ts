import axios from 'axios';
import preval from 'next-plugin-preval';
import * as htmlparser2 from 'htmlparser2';
import { getOuterHTML } from 'domutils';
import { PREVALUATED_COURSE_TREES } from './course_info/prevaluated-course-trees';

const SCRIPT_MMT_URL = 'https://mmt.beta.vollki.kwarc.info';
const COURSE_ROOTS = {
  'ai-1': '/:sTeX/document?archive=MiKoMH/AI&filepath=course/notes/notes.xhtml',
  iwgs: '/:sTeX/document?archive=MiKoMH/IWGS&filepath=course/notes/notes.xhtml',
  lbs: '/:sTeX/document?archive=MiKoMH/LBS&filepath=course/notes/notes.xhtml',
  krmt: '/:sTeX/document?archive=MiKoMH/KRMT&filepath=course/notes/notes.xhtml',
};
const fromPrevaluated = true;

export interface TreeNode {
  parent?: TreeNode; // Can't be filled during preval.
  titleAsHtml: string;
  children: TreeNode[];

  archive: string;
  filepath: string;
  level: number;
  endsSection: boolean; // Will always be false when returned from this script.
}

function archiveAndFilepathFromUrl(url: string) {
  const match = /archive=([^&]+)&filepath=(.+)/g.exec(url);
  const archive = match?.[1] || '';
  const filepath = match?.[2] || '';
  return { archive, filepath };
}

async function delay(timeMs: number) {
  return new Promise((resolve) => setTimeout(resolve, timeMs));
}

async function getChildNodesOfDocNode(
  node: any,
  level: number
): Promise<TreeNode[]> {
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
    const childNode = await getDocumentTree(embedUrl, level + 1, titleAsHtml);
    return [childNode];
  }
  const nodes: TreeNode[] = [];
  const children = node.childNodes || node.children || [];
  const childNodesPromiseList: Promise<TreeNode[]>[] = [];
  for (const child of children) {
    childNodesPromiseList.push(getChildNodesOfDocNode(child, level));
  }
  const childNodesList = await Promise.all(childNodesPromiseList);
  for (const childNodes of childNodesList) {
    nodes.push(...childNodes);
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
const startTime = Date.now();

async function getDocumentTree(
  docUrl: string,
  level: number,
  titleAsHtml = ''
): Promise<TreeNode> {
  const fullUrl = `${SCRIPT_MMT_URL}${docUrl}`;
  if (fetchedDocs % 100 === 0) {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    console.log(`${fetchedDocs}: ${elapsed}s\n${docUrl}`);
  }
  fetchedDocs++;
  let docContent;
  for (let i = 0; i < 10; i++) {
    try {
      docContent = await axios.get(fullUrl).then((r) => r.data);
      break;
    } catch (e) {
      console.log(`\nFailed\n${fullUrl}`);
      await delay(3000 * i);
    }
  }
  const { archive, filepath } = archiveAndFilepathFromUrl(docUrl);

  // DOMParser is not available on nodejs.
  const htmlDoc = htmlparser2.parseDocument(docContent);
  const children = await getChildNodesOfDocNode(htmlDoc, level);

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
  for (const [courseId, courseRoot] of Object.entries(COURSE_ROOTS)) {
    const docTree = await getDocumentTree(courseRoot, 0);
    trees[courseId] = docTree;
    console.log(`${courseId} tree:\n`);
    console.log(printTree(docTree));
  }
  return trees;
}

export default preval(getCourseTrees());
