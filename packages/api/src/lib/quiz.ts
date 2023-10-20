import { ChildNode, Document, Element } from 'domhandler';
import { DomUtils, parseDocument } from 'htmlparser2';

export enum Phase {
  UNSET = 'UNSET',
  NOT_STARTED = 'NOT_STARTED',
  STARTED = 'STARTED',
  ENDED = 'ENDED',
  FEEDBACK_RELEASED = 'FEEDBACK_RELEASED',
}

export interface Quiz {
  id: string;
  version: number;

  courseId: string;
  courseTerm: string;
  quizStartTs: number;
  quizEndTs: number;
  feedbackReleaseTs: number;
  manuallySetPhase: Phase;

  title: string;
  problems: { [problemId: string]: string };

  updatedAt: number;
  updatedBy: string;
}

export enum Tristate {
  TRUE = 'TRUE',
  FALSE = 'FALSE',
  UNKNOWN = 'UNKNOWN',
}

export interface Option {
  shouldSelect: Tristate;
  value: { outerHTML: string; textContent?: string };
  feedbackHtml: string;
}

export enum ProblemType {
  MULTI_CHOICE_SINGLE_ANSWER = 'MULTI_CHOICE_SINGLE_ANSWER',
  MULTI_CHOICE_MULTI_ANSWER = 'MULTI_CHOICE_MULTI_ANSWER',
  FILL_IN = 'FILL_IN',
}

export interface Problem {
  type: ProblemType;
  statement: { outerHTML: string };
  options?: Option[];
  fillInSolution?: string;
  points: number;
}

export interface UserResponse {
  filledInAnswer?: string;
  singleOptionIdxs?: number[];
  multipleOptionIdxs?: { [index: number]: boolean };
}

export interface QuizStatsResponse {
  attemptedHistogram: { [attempted: number]: number };
  scoreHistogram: { [score: number]: number };
}

// For recording quizzes at /quiz/old
export interface TimerEvent {
  type: TimerEventType;
  timestamp_ms: number;
  problemIdx?: number;
}

export enum TimerEventType {
  SWITCH = 'SWITCH',
  PAUSE = 'PAUSE',
  UNPAUSE = 'UNPAUSE',
  SUBMIT = 'SUBMIT',
}

export interface ProblemInfo {
  duration_ms: number;
  url: string;
  points: number | undefined;
  response: UserResponse;
}

export interface QuizResult {
  resultId: string;
  quizName: string;
  quizTakerName: string;
  events: TimerEvent[];
  duration_ms: number;
  problemInfo: ProblemInfo[];
}

export interface GetQuizResponse {
  currentServerTs: number;
  quizStartTs?: number;
  quizEndTs?: number;
  feedbackReleaseTs?: number;

  phase: Phase;

  problems: { [problemId: string]: string };
  responses: { [problemId: string]: UserResponse };
}

export interface InsertAnswerRequest {
  quizId: string;
  problemId: string;

  filledInAnswer?: string;
  singleOptionIdxs?: number[];
  multipleOptionIdxs?: { [index: number]: boolean };

  browserTimestamp_ms: number;
}

export interface QuizStubInfo {
  quizId: string;
  quizStartTs: number;
  quizEndTs: number;
  title: string;
}

function filledInProblemPoints(problem: Problem, filledIn?: string) {
  if (!problem.fillInSolution?.length) return undefined;
  if (!filledIn?.length) return 0;
  return filledIn.toLowerCase() === problem.fillInSolution?.toLowerCase()
    ? problem.points
    : 0;
}

function singleAnswerMCQPoints(problem: Problem, singleOptionIdxs?: number[]) {
  if (!singleOptionIdxs?.length) return 0;
  const options = problem.options ?? [];
  const correctOption = options.findIndex(
    (o) => o.shouldSelect === Tristate.TRUE
  );
  if (correctOption === -1) return undefined;
  return singleOptionIdxs?.[0] === correctOption ? problem.points : 0;
}

function multiAnswerMCQPoints(
  problem: Problem,
  multiOptionIdx?: { [index: number]: boolean },
) {
  const options = problem.options ?? [];
  const anyUnknown = options.some(
    (option) => option.shouldSelect === Tristate.UNKNOWN
  );
  if (anyUnknown) return undefined;
  for (const [idx, option] of options.entries() ?? []) {
    const isSelected = multiOptionIdx?.[idx] ?? false;
    const shouldSelect = option.shouldSelect === Tristate.TRUE;
    if (isSelected !== shouldSelect) return 0;
  }
  return problem.points;
}

export function getPoints(problem: Problem, response?: UserResponse) {
  if (!response) return 0;
  const { filledInAnswer, singleOptionIdxs, multipleOptionIdxs } = response;
  if (problem.type === ProblemType.FILL_IN) {
    return filledInProblemPoints(problem, filledInAnswer);
  } else if (problem.type === ProblemType.MULTI_CHOICE_SINGLE_ANSWER) {
    return singleAnswerMCQPoints(problem, singleOptionIdxs);
  } else if (problem.type === ProblemType.MULTI_CHOICE_MULTI_ANSWER) {
    return multiAnswerMCQPoints(problem, multipleOptionIdxs);
  }

  return undefined;
}

function recursivelyFindNodes(
  node: Document | (ChildNode & Element),
  attrName: string,
  expected?: any
): { node: Element; attrVal: any }[] {
  if (node instanceof Element) {
    const attrVal = node.attribs[attrName];
    if (attrVal && (expected === undefined || expected === attrVal)) {
      return [{ node, attrVal }];
    }
  }
  const foundList: { node: Element; attrVal: any }[] = [];
  const children = node.childNodes;
  for (const child of children || []) {
    //const child = children.item(i);
    if (child instanceof Element) {
      const subFoundList = recursivelyFindNodes(child, attrName, expected);
      if (subFoundList?.length) foundList.push(...subFoundList);
    }
  }
  return foundList;
}

function removeNodeWithAttrib(
  node: (ChildNode & Element) | Document,
  attrName: string
) {
  if (node instanceof Element) {
    const attrVal = node.attribs[attrName];
    if (attrVal) {
      node.attribs['style'] = 'display: none';
      // console.log(node);
    }
  }

  for (const child of node.childNodes ?? []) {
    // const child = children.item(i);
    if (child instanceof Element) {
      removeNodeWithAttrib(child, attrName);
    }
  }
}

function findProblemRootNode(node: (ChildNode & Element) | Document) {
  return recursivelyFindNodes(node, 'data-problem')?.[0]?.node;
}

function findChoiceInfo(
  problemRootNode: (ChildNode & Element) | Document
): { options: Option[]; type: ProblemType } | undefined {
  const mcbNode = recursivelyFindNodes(problemRootNode, 'data-problem-mcb')?.[0]
    ?.node;
  const scbNode = recursivelyFindNodes(problemRootNode, 'data-problem-scb')?.[0]
    ?.node;
  if (!mcbNode && !scbNode)
    return { options: undefined, type: undefined } as any;

  let type;
  if (mcbNode) {
    type = ProblemType.MULTI_CHOICE_MULTI_ANSWER;
    removeNodeWithAttrib(problemRootNode, 'data-problem-mcb');
  } else {
    type = ProblemType.MULTI_CHOICE_SINGLE_ANSWER;
    removeNodeWithAttrib(problemRootNode, 'data-problem-scb');
  }
  const optionBlock = scbNode ?? mcbNode;
  const problemNodeAttr = scbNode ? 'data-problem-sc' : 'data-problem-mc';
  const solutionNodeAttr = problemNodeAttr + '-solution';

  const options = recursivelyFindNodes(optionBlock, problemNodeAttr).map(
    ({ node, attrVal }) => {
      const feedbackNode = recursivelyFindNodes(node, solutionNodeAttr)?.[0]
        ?.node;
      const feedbackHtml = feedbackNode
        ? DomUtils.getOuterHTML(feedbackNode)
        : '';
      removeNodeWithAttrib(node, solutionNodeAttr);
      const shouldSelect =
        attrVal === 'true'
          ? Tristate.TRUE
          : attrVal === 'false'
          ? Tristate.FALSE
          : Tristate.UNKNOWN;
      const outerHTML = DomUtils.getOuterHTML(node);
      return { shouldSelect, value: { outerHTML }, feedbackHtml };
    }
  );
  return { options, type };
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

  return DomUtils.textContent(fillInSolution);
}

function getProblemPoints(rootNode: Element) {
  const pointsStr = rootNode?.attribs?.['data-problem-points'];
  if (!pointsStr) return 1;
  const parsedInt = parseInt(pointsStr, 10);
  return (isNaN(parsedInt) || parsedInt === 0) ? 1 : parsedInt;
}

export function getProblem(htmlStr: string, problemUrl: string) {
  const htmlDoc = parseDocument(htmlStr);
  const problemRootNode = findProblemRootNode(htmlDoc);
  const points = getProblemPoints(problemRootNode);
  if (!problemRootNode) {
    return {
      type: ProblemType.FILL_IN,
      statement: { outerHTML: `<span>Not found: ${problemUrl}</span>` },
    } as Problem;
  }
  removeNodeWithAttrib(problemRootNode, 'data-problem-solution');
  removeNodeWithAttrib(problemRootNode, 'data-problem-g-note');
  removeNodeWithAttrib(problemRootNode, 'data-problem-minutes');
  const { options, type } = findChoiceInfo(problemRootNode) as any;
  const fillInSolution = findFillInSolution(problemRootNode);

  const problem = {
    type: type || ProblemType.FILL_IN,
    statement: { outerHTML: DomUtils.getOuterHTML(problemRootNode) }, // The mcb block is already marked display:none.
    options,
    fillInSolution,
    points,
  } as Problem;
  return problem;
}

export function getQuizPhase(q: Quiz) {
  if (q.manuallySetPhase && q.manuallySetPhase !== Phase.UNSET) {
    return q.manuallySetPhase;
  }
  const now = Date.now();
  if (now < q.quizStartTs) return Phase.NOT_STARTED;
  if (now < q.quizEndTs) return Phase.STARTED;
  if (now < q.feedbackReleaseTs) return Phase.ENDED;
  return Phase.FEEDBACK_RELEASED;
}
