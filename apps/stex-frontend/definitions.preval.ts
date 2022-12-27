import * as htmlparser2 from 'htmlparser2';
import preval from 'next-plugin-preval';
import { AI_1_COURSE_SECTIONS } from './course_info/ai-1-notes';
import { PREVALUATED_DEFINITIONS } from './course_info/prevaluated-definitions';
import {
  archiveAndFilepathFromUrl,
  COURSE_ROOTS,
  fetchDocumentCached,
  preFetchDescendentsOfDoc,
  SCRIPT_MMT_URL,
} from './notes-trees.preval';
import { getOuterHTML } from 'domutils';
import { exit } from 'process';

const fromPrevaluated = false;
const ENDING_CHAPTER = 'Automated Theorem Proving in First-Order Logic';
export interface DefInfo {
  chapter: string;
  uri: string;
  htmlNode: string;
}

export interface DefsAndLatestChapter {
  defs: DefInfo[];
  chapter: string;
}

function getChapter(url: string, courseId: string, defaultChap: string) {
  if (courseId !== 'ai-1') return defaultChap;
  const { archive, filepath } = archiveAndFilepathFromUrl(url);
  const nodeId = `${archive}||${filepath}`;
  for (const [chapTitle, deckList] of Object.entries(AI_1_COURSE_SECTIONS)) {
    for (const deckId of Object.keys(deckList)) {
      if (deckId === nodeId) return chapTitle;
    }
  }
  return defaultChap;
}

function getDefsOfDocNode(node: any, courseId:string, chapter: string): DefsAndLatestChapter {
  if (node.attribs?.['property'] === 'stex:definiendum') {
    if (node.attribs?.['data-overlay-link-click'])
      delete node.attribs['data-overlay-link-click'];
    const htmlNode = getOuterHTML(node);
    const def = { uri: node.attribs?.['resource'], chapter, htmlNode };
    return { defs: [def], chapter };
  }
  const embedUrl = node.attribs?.['data-inputref-url'];
  if (embedUrl) {
    return getDefinitionsOfDoc(embedUrl, courseId, chapter);
  }
  const children = node.childNodes || node.children || [];
  const defs: DefInfo[] = [];
  for (const child of children) {
    const v = getDefsOfDocNode(child, courseId, chapter);
    defs.push(...v.defs);
    chapter = v.chapter;
    if (chapter === ENDING_CHAPTER) break;
  }
  return { defs, chapter };
}

function printDefinitions(grouped: { [chapter: string]: DefInfo[] }) {
  let out = '';
  for (const [chapter, defs] of Object.entries(grouped)) {
    out += `    '${chapter}': [\n`;
    for (const def of defs) {
      out += `      { uri: \`${def.uri}\`, chapter: \`${def.chapter}\`, htmlNode: \`${def.htmlNode}\`},\n`;
    }
    out += '    ],\n';
  }
  return out;
}

function getDefinitionsOfDoc(
  docUrl: string,
  courseId: string,
  defaultChapter: string
): DefsAndLatestChapter {
  const fullUrl = `${SCRIPT_MMT_URL}${docUrl}`;
  const chapter = getChapter(docUrl, courseId, defaultChapter);

  if (chapter === ENDING_CHAPTER) return { defs: [], chapter };

  const docContent = fetchDocumentCached(fullUrl);
  // DOMParser is not available on nodejs.
  const htmlDoc = htmlparser2.parseDocument(docContent);
  return getDefsOfDocNode(htmlDoc, courseId, chapter);
}

function uriExists(defs: DefInfo[], uri: string) {
  for (const def of defs) if (uri === def.uri) return true;
  return false;
}

function groupByChapter(defs: DefInfo[]) {
  let chapter = undefined;
  const byChapter: { [chapter: string]: DefInfo[] } = {};
  for (const def of defs) {
    const defChapter = def.chapter;
    if (defChapter !== chapter) {
      if (defChapter in byChapter) {
        console.log(defs);
        console.log(`${defChapter} repeated`);
        exit(0);
      }
      chapter = defChapter;
      byChapter[chapter] = [];
    }
    if (!uriExists(byChapter[chapter], def.uri)) {
      byChapter[chapter].push(def);
    }
  }
  return byChapter;
}

async function getDefinitions() {
  if (fromPrevaluated) return PREVALUATED_DEFINITIONS;

  console.log(`\n\n\nGetting defs from ${SCRIPT_MMT_URL}\n\n\n`);
  const courseDefs: { [courseId: string]: { [chapter: string]: DefInfo[] } } =
    {};
  for (const [courseId, courseRoot] of Object.entries(COURSE_ROOTS)) {
    await preFetchDescendentsOfDoc(courseRoot);
    const ungrouped = getDefinitionsOfDoc(courseRoot, courseId, 'all').defs;
    //console.log(printDefinitions({ all: ungrouped }));
    courseDefs[courseId] = groupByChapter(ungrouped);
  }

  console.log(
    `export const PREVALUATED_DEFINITIONS: { [courseId: string]: {[chapter:string]: {chapter: string; uri: string, htmlNode: string}[]} } = {`
  );
  for (const courseId of Object.keys(COURSE_ROOTS)) {
    const defs = courseDefs[courseId];
    console.log(`  '${courseId}': ` + '{\n' + printDefinitions(defs) + '  },');
  }
  console.log(`};`);
  return courseDefs;
}

export default preval(getDefinitions());
