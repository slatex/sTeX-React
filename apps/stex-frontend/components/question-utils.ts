import { convertHtmlStringToPlain } from '@stex-react/utils';
import {
  QuestionStatus,
  QuizResult,
  TimerEvent,
  UserResponse,
} from '../shared/quiz';
import { getElapsedTime, getTotalElapsedTime } from './QuizTimer';
import { v4 as uuidv4 } from 'uuid';

export interface Option {
  shouldSelect: boolean;
  value: any[];
  feedbackHtml: string;
}

export enum QuestionType {
  MULTI_CHOICE_SINGLE_ANSWER,
  MULTI_CHOICE_MULTI_ANSWER,
  FILL_IN,
}

export interface Question {
  type: QuestionType;
  statement: Element;
  options?: Option[];
  fillInSolution?: string;
}

function recursivelyFindNodes(
  node: Element | Document,
  attrName: string,
  expected?: any
): { node: Element; attrVal: any }[] {
  if (node instanceof Element) {
    const attrVal = node.getAttribute(attrName);
    if (attrVal && (expected === undefined || expected === attrVal)) {
      return [{ node, attrVal }];
    }
  }
  const foundList: { node: Element; attrVal: any }[] = [];
  const children = node.childNodes;
  for (let i = 0; i < children.length; i++) {
    const child = children.item(i);
    if (child instanceof Element) {
      const subFoundList = recursivelyFindNodes(child, attrName, expected);
      if (subFoundList?.length) foundList.push(...subFoundList);
    }
  }
  return foundList;
}

function removeNodeWithAttrib(node: Element | Document, attrName: string) {
  if (node instanceof Element) {
    const attrVal = node.getAttribute(attrName);
    if (attrVal) {
      node.setAttribute('style', 'display: none');
      // console.log(node);
    }
  }
  const children = node.childNodes;
  for (let i = 0; i < children.length; i++) {
    const child = children.item(i);
    if (child instanceof Element) {
      removeNodeWithAttrib(child, attrName);
    }
  }
}

function findProblemRootNode(node: Element | Document) {
  return recursivelyFindNodes(node, 'data-problem')?.[0]?.node;
}

function findOptions(
  problemRootNode: Element | Document
): Option[] | undefined {
  const mcbNode = recursivelyFindNodes(problemRootNode, 'data-problem-mcb')?.[0]
    ?.node;
  removeNodeWithAttrib(problemRootNode, 'data-problem-mcb');
  if (!mcbNode) return undefined;

  return recursivelyFindNodes(mcbNode, 'data-problem-mc').map(
    ({ node, attrVal }) => {
      const feedbackHtml = recursivelyFindNodes(
        node,
        'data-problem-mc-solution'
      )?.[0]?.node.outerHTML;
      removeNodeWithAttrib(node, 'data-problem-mc-solution');

      return { shouldSelect: attrVal === 'true', value: [node], feedbackHtml };
    }
  );
}

function findFillInSolution(
  problemRootNode: Element | Document
): string | undefined {
  const fillInSolution = recursivelyFindNodes(
    problemRootNode,
    'data-problem-fillinsol'
  )?.[0]?.node;
  removeNodeWithAttrib(problemRootNode, 'data-problem-fillinsol');
  if (!fillInSolution) return undefined;

  return convertHtmlStringToPlain(fillInSolution.outerHTML);
}

export function getQuestion(htmlDoc: Document, questionUrl: string) {
  const problemRootNode = findProblemRootNode(htmlDoc);
  if (!problemRootNode) {
    return {
      type: QuestionType.FILL_IN,
      statement: { outerHTML: `<span>Not found: ${questionUrl}</span>` },
    } as Question;
  }
  const options = findOptions(problemRootNode);
  const fillInSolution = findFillInSolution(problemRootNode);
  if (!options && !fillInSolution) {
    console.error('Neither options nor fill-in-solution found');
  }
  const numCorrect =
    options?.filter((option) => option.shouldSelect)?.length || 0;
  const type = fillInSolution
    ? QuestionType.FILL_IN
    : numCorrect >= 2
    ? QuestionType.MULTI_CHOICE_MULTI_ANSWER
    : QuestionType.MULTI_CHOICE_SINGLE_ANSWER;
  const question: Question = {
    type,
    statement: problemRootNode, // The mcb block is already marked display:none.
    options,
    fillInSolution,
  };
  // console.log(question);
  return question;
}

function getQuestionInfo(
  idx: number,
  events: TimerEvent[],
  url: string,
  response: UserResponse,
  status: QuestionStatus
) {
  return {
    duration_ms: getElapsedTime(events, idx),
    url,
    response,
    status,
  };
}

export function getQuizResult(
  quizTakerName: string,
  quizName: string,
  events: TimerEvent[],
  questionUrls: string[],
  responses: UserResponse[],
  statuses: QuestionStatus[]
): QuizResult {
  return {
    resultId: uuidv4(),
    quizName,
    quizTakerName,
    events,
    duration_ms: getTotalElapsedTime(events),
    questionInfo: questionUrls.map((u, idx) =>
      getQuestionInfo(idx, events, u, responses[idx], statuses[idx])
    ),
  };
}

export function getMaaiMayQuestionURLs(mmtUrl: string, full: boolean) {
  const questionFilepaths = [
    'mathliteracy/prob/problem003',
    'mathliteracy/prob/problem004',
    'mathliteracy/prob/problem005',
    'mathliteracy/prob/problem007',
    'mathliteracy/prob/problem012',
    'mathliteracy/prob/problem000',
    'AuD/prob/problem002',
    'AuD/prob/problem003',
    'AuD/prob/problem005',
    'AuD/prob/problem008',
    'AuD/prob/problem009',
    'AuD/prob/problem010a',
    'AuD/prob/problem014',
    'AuD/prob/problem015',
    'programming/prob/loop-complexity.en',
    'theoinf/prob/tsp-props.en',
    'theoinf/prob/lang-props.en',
    'theoinf/prob/fa-ab1.en',
    'theoinf/prob/tf-regular-accepts.en',
    'theoinf/prob/tf-cfl-undec.en',
    'theoinf/prob/TM-equiv.en',
    'db/prob/erdiag1.en',
    'db/prob/erdiag2.en',
    'db/prob/relation-model.en',
    'db/prob/SQL1.en',
    'security/prob/sccrypto-which.en',
    'security/prob/hash-which.en',
    'security/prob/keys.en',
    'security/prob/procmodes.en',
    'logic/prob/pl0-tautologies.en',
    'logic/prob/pl1-classification-short',
    'mathliteracy/prob/problem016',
    'math/prob/problem002',
    'math/prob/problem006',
    'math/prob/problem007',
    'math/prob/problem008',
    'math/prob/problem010',
    'math/prob/problem012a',
    'math/prob/problem013',
    'math/prob/problem016',
    'math/prob/problem017',
    'math/prob/problem028',
    'math/prob/problem034',
    'math/prob/problem042',
  ];
  const all = questionFilepaths.map(
    (f) =>
      `${mmtUrl}/:sTeX/document?archive=problems/maai-test&filepath=${f}.xhtml`
  );
  const smallSetIdx = [0, 8, 14, 18, 21];
  return full ? all : all.filter((v, idx) => smallSetIdx.includes(idx));
}
