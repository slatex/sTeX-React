import { Phase, Quiz } from '@stex-react/api';
import dayjs from 'dayjs';
import fs from 'fs';
import { DomHandler, DomUtils, Parser } from 'htmlparser2';
import path from 'path';

let QUIZ_CACHE: Map<string, Quiz> | undefined = undefined;
let QUIZ_CACHE_TS: number | undefined = undefined;
const QUIZ_CACHE_TTL = 1000 * 10; // 10 sec

function isCacheValid() {
  if (!QUIZ_CACHE || !QUIZ_CACHE_TS) return false;
  return Date.now() < QUIZ_CACHE_TS + QUIZ_CACHE_TTL;
}
function refreshCacheIfNeeded() {
  if (isCacheValid()) return true;
  refreshQuizCache();
}

function refreshQuizCache() {
  console.log(
    '\n\n\nRefreshing Cache: ' + dayjs(Date.now()).format('YYYY-MM-DD HH:mm:ss')
  );
  QUIZ_CACHE = new Map<string, Quiz>();
  QUIZ_CACHE_TS = Date.now();
  const quizFiles = fs.readdirSync(process.env.QUIZ_INFO_DIR);
  quizFiles.forEach((file) => {
    if (!(file.startsWith('quiz-') && file.endsWith('.json'))) return;
    const quiz = JSON.parse(
      fs.readFileSync(process.env.QUIZ_INFO_DIR + '/' + file, 'utf-8')
    ) as Quiz;
    QUIZ_CACHE.set(quiz.id, quiz);
  });
}

export function writeQuizFile(quiz: Quiz) {
  const filePath = getQuizFilePath(quiz.id);
  fs.writeFileSync(filePath, JSON.stringify(quiz, null, 2));
  invalidateQuizCache();
}

export function invalidateQuizCache() {
  QUIZ_CACHE = undefined;
  QUIZ_CACHE_TS = undefined;
}

export function getAllQuizzes() {
  refreshCacheIfNeeded();
  return Array.from(QUIZ_CACHE.values());
}

export function getQuizFilePath(id: string) {
  if (!id) return undefined;
  return path.join(process.env.QUIZ_INFO_DIR, `${id}.json`);
}

export function getBackupQuizFilePath(id: string, version: number) {
  if (!id) return undefined;
  return path.join(process.env.QUIZ_INFO_DIR, `_bkp-v${version}-${id}.json`);
}

export function doesQuizExist(id: string) {
  if (!id?.length) return false;
  const quizFileName = getQuizFilePath(id);
  return fs.existsSync(quizFileName);
}

export function getQuiz(id: string) {
  refreshCacheIfNeeded();
  return QUIZ_CACHE.get(id);
}

export function getQuizTimes(q: Quiz) {
  if (q.manuallySetPhase && q.manuallySetPhase !== Phase.UNSET) return {};

  const { quizStartTs, quizEndTs, feedbackReleaseTs } = q;
  return { quizStartTs, quizEndTs, feedbackReleaseTs };
}

const ANSWER_ATTRIBS_TO_REDACT = ['data-problem-sc', 'data-problem-mc'];

const ATTRIBS_TO_REMOVE = [
  'data-overlay-link-click',
  'data-overlay-link-hover',
  'data-highlight-parent',
];

const ATTRIBS_OF_ANSWER_ELEMENTS = [
  'data-problem-fillinsol',
  'data-problem-sc-solution',
  'data-problem-mc-solution',
];

export function removeAnswerInfo(problem: string) {
  const handler = new DomHandler();
  const parser = new Parser(handler);
  parser.write(problem);
  parser.end();

  // Traverse and modify the parsed DOM to remove nodes with 'solution' attribute
  const traverse = (node) => {
    if (node.attribs) {
      for (const attrib of ATTRIBS_OF_ANSWER_ELEMENTS) {
        // Skip this node and its children
        if (node.attribs[attrib]) return null;
      }
      const classNames = node.attribs['class'];
      if (classNames?.includes('symcomp')) {
        node.attribs['class'] = classNames.replace('symcomp', ' ');
      }

      for (const attrib of ANSWER_ATTRIBS_TO_REDACT) {
        if (node.attribs[attrib]) node.attribs[attrib] = 'REDACTED';
      }
      for (const attrib of ATTRIBS_TO_REMOVE) {
        if (node.attribs[attrib]) delete node.attribs[attrib];
      }
    }

    // Recursively traverse and process children
    node.children = node.children?.map(traverse).filter(Boolean);
    return node;
  };

  const modifiedDom = handler.dom.map((n) => traverse(n));
  // Convert the modified DOM back to HTML
  return DomUtils.getOuterHTML(modifiedDom);
}
