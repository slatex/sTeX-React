import { Phase, Quiz } from '@stex-react/api';
import fs from 'fs';
import { DomHandler, DomUtils, Parser } from 'htmlparser2';
import path from 'path';

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
  if (!doesQuizExist(id)) return undefined;
  const quizStr = fs.readFileSync(getQuizFilePath(id), 'utf-8');
  return JSON.parse(quizStr) as Quiz;
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
