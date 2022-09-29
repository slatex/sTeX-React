import axios from 'axios';
import preval from 'next-plugin-preval';
import * as htmlparser2 from 'htmlparser2';
import { getOuterHTML } from 'domutils';
import { AI_1_NOTES_PREVALUATED_TREE } from './course_info/ai-1-notes';

const SCRIPT_BASE_URL = 'https://stexmmt.mathhub.info';
const ROOT_DOC =
  '/:sTeX/document?archive=MiKoMH/AI&filepath=course/notes/notes.xhtml';
// '/:sTeX/document?archive=MiKoMH/AI&filepath=course/fragments/lecturing.en.xhtml';
//'/:sTeX/document?archive=MiKoMH/AI&filepath=course/fragments/overview.en.xhtml';
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
  let line =
    '.'.repeat(level) +
    `||${node.archive}||${node.filepath}||${node.titleAsHtml || ''}\n`;
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
  if (fromPrevaluated) {
    let root = null;
    const parents = [];
    for (const line of AI_1_NOTES_PREVALUATED_TREE.split('\n')) {
      const n = createNode(parents, line);
      if (!root) root = n;
    }
    return root;
  }
  const fullUrl = `${SCRIPT_BASE_URL}${docUrl}`;
  if (fetchedDocs % 100 === 0) {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    console.log(`${fetchedDocs}: ${elapsed}s\n${docUrl}`);
  }
  fetchedDocs++;
  const docContent = await axios.get(fullUrl).then((r) => r.data);
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

  if (docUrl === ROOT_DOC) console.log(printTree(node));
  return node;
}

export default preval(getDocumentTree(ROOT_DOC, 0));
