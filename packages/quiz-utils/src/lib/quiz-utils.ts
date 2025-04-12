import {
  AnswerClass,
  FillInAnswerClass,
  FillInAnswerClassType,
  FTMLProblemWithSolution,
  Input,
  InputType,
  Option,
  Phase,
  Problem,
  ProblemResponse,
  QuadState,
  QuizWithStatus,
  SubProblemData,
  Tristate,
} from '@stex-react/api';
import { Solutions } from '@stex-react/ftml-utils';
import { getMMTCustomId, truncateString } from '@stex-react/utils';
import { DomUtils, parseDocument } from 'htmlparser2';

// Hack: Fix this properly later
//import { ChildNode, Document, Element1 } from 'domhandler';
export type ChildNode = any;
export type Document = any;
export type Element1 = any;

const NODE_ATTRS_TO_TYPE: { [attrName: string]: InputType } = {
  'data-problem-mcb': InputType.MCQ,
  'data-problem-scb': InputType.SCQ,
  'data-problem-fillinsol': InputType.FILL_IN,
};

export const PROBLEM_PARSED_MARKER = 'problem-parsed';
type MCQ_GRADING_SCHEME =
  | 'ALL_OR_NOTHING'
  | 'PARTIAL_CREDIT'
  | 'PARTIAL_CREDIT_WITH_NEGATIVE_MARKING';

function doesMatch(answerClass: FillInAnswerClass, trimmedActual?: string) {
  if (!trimmedActual) return false;
  switch (answerClass.type) {
    case FillInAnswerClassType.exact: {
      const { exactMatch } = answerClass;
      const exactMatchNormalized = exactMatch?.toLowerCase();
      return exactMatchNormalized === trimmedActual.toLowerCase();
    }
    case FillInAnswerClassType.numrange: {
      const { startNum, endNum } = answerClass; // Invalid answer class.
      if (startNum === undefined || endNum === undefined) return false;

      const actualNum = parseFloat(trimmedActual);
      if (isNaN(actualNum)) return false;
      if (!isNaN(startNum) && actualNum < startNum) return false;
      if (!isNaN(endNum) && actualNum > endNum) return false;
      return true;
    }
    case FillInAnswerClassType.regex: {
      const { regex } = answerClass;
      if (!regex) return false;
      // Creating a RegExp object with the 'i' flag for case-insensitive matching
      return new RegExp(regex.trim(), 'i').test(trimmedActual);
    }
    default:
      return false;
  }
}

export function getFillInFeedbackHtml(fillInInput: Input, trimmedActual?: string) {
  const answerClasses = fillInInput.fillInAnswerClasses ?? [];
  const matchedAC = answerClasses.find((ac) => doesMatch(ac, trimmedActual));
  if (matchedAC?.feedbackHtml) return matchedAC.feedbackHtml;

  const correctAC = answerClasses.find((a) => a.verdict);
  if (!correctAC) return '<i>Internal Error: No solution found in the problem!</i>';
  const { exactMatch, startNum, endNum, regex } = correctAC;

  const isCorrect = isFillInInputCorrect(answerClasses, trimmedActual) === Tristate.TRUE;
  if (isCorrect) return 'Correct!';
  const forIncorrect = exactMatch || regex || `[${startNum}, ${endNum}]`;
  const forIncorrectTrunc = truncateString(forIncorrect, 200);
  return `The correct answer is <b><code>${forIncorrectTrunc}</code></b>`;
}

export function isFillInInputCorrect(answerClasses?: FillInAnswerClass[], actual?: string) {
  if (!answerClasses?.length) return Tristate.UNKNOWN;
  const trimmedActual = actual?.trim();
  if (!trimmedActual?.length) return Tristate.FALSE;

  for (const answerClass of answerClasses) {
    const match = doesMatch(answerClass, trimmedActual);
    if (match) return answerClass.verdict ? Tristate.TRUE : Tristate.FALSE;
  }
  return Tristate.FALSE;
}

function fillInCorrectnessQuotient(answerClasses?: FillInAnswerClass[], actual?: string) {
  switch (isFillInInputCorrect(answerClasses, actual)) {
    case Tristate.TRUE:
      return 1;
    case Tristate.FALSE:
      return 0;
    case Tristate.UNKNOWN:
    default:
      return NaN;
  }
}

function scqCorrectnessQuotient(options?: Option[], singleOptionIdx?: string) {
  const correctOptions = (options || []).filter((o) => o.shouldSelect === QuadState.TRUE);
  if (!correctOptions.length) return NaN;
  return correctOptions.some((o) => o.optionId === singleOptionIdx) ? 1 : 0;
}

function mcqCorrectnessQuotient(options?: Option[], multiOptionIdx?: { [index: number]: boolean }) {
  if (!options?.length) return NaN;
  if (!multiOptionIdx) return 0;
  const anyUnknown = options.some((option) => option.shouldSelect === QuadState.UNKNOWN);
  if (anyUnknown) return NaN;

  const numSelected = Object.values(multiOptionIdx ?? {}).filter((x) => x).length;
  if (numSelected === 0) return 0;
  let numCorrect = 0;
  for (const [idx, option] of options.entries() ?? []) {
    if (option.shouldSelect === QuadState.ANY) {
      numCorrect++;
      continue;
    }
    const isSelected = multiOptionIdx?.[idx] ?? false;
    const shouldSelect = option.shouldSelect === QuadState.TRUE;
    if (isSelected === shouldSelect) numCorrect++;
  }

  switch (process.env['NEXT_PUBLIC_MCQ_GRADING_SCHEME'] as MCQ_GRADING_SCHEME) {
    case 'ALL_OR_NOTHING':
      return numCorrect === options.length ? 1 : 0;
    case 'PARTIAL_CREDIT':
      return numCorrect / options.length;
    case 'PARTIAL_CREDIT_WITH_NEGATIVE_MARKING':
    default:
      return Math.max((2 * numCorrect - options.length) / options.length, 0);
  }
}

export function getPoints(problem: FTMLProblemWithSolution, response?: ProblemResponse) {
  if (!response) return 0;
  if (!problem?.solution) return NaN;
  const s = Solutions.from_jstring(problem.solution);
  const fraction = s?.check_response(response)?.score_fraction;
  return fraction ? fraction * (problem.problem.total_points ?? 1) : NaN;
}

function recursivelyFindNodes(
  node: Document | (ChildNode & Element1),
  attrNames: string[]
): { node: Element1; attrName: string; attrVal: any }[] {
  if (node?.attribs) {
    // node instanceof Element1
    for (const attrName of attrNames) {
      const attrVal = node.attribs[attrName];
      if (attrVal || attrVal === '') return [{ node, attrName, attrVal }];
    }
  }
  const foundList: { node: Element1; attrName: string; attrVal: any }[] = [];
  const children = node.childNodes;
  for (const child of children || []) {
    //const child = children.item(i);
    if (child?.attribs) {
      // child instanceof Element1
      const subFoundList = recursivelyFindNodes(child, attrNames);
      if (subFoundList?.length) foundList.push(...subFoundList);
    }
  }
  return foundList;
}

function removeNodeWithAttrib(node: (ChildNode & Element1) | Document, attrNames: string[]) {
  if (node?.attribs) {
    // node instanceof Element1
    for (const attrName of attrNames) {
      const attrVal = node.attribs[attrName];
      if (attrVal) {
        node.attribs['style'] = 'display: none';
      }
    }
  }

  for (const child of node.childNodes ?? []) {
    // const child = children.item(i);
    if (child?.attribs) {
      //child instanceof Element1)
      removeNodeWithAttrib(child, attrNames);
    }
  }
}

function isInlineBlock(node: Element1) {
  return node.attribs['data-problem-scb-inline'] === 'true';
}

function isIgnoredForScoring(node: Element1) {
  return node.attribs['data-problem-ignore-scoring'] === 'true';
}

function findProblemRootNode(node: (ChildNode & Element1) | Document) {
  return recursivelyFindNodes(node, ['data-problem'])?.[0]?.node;
}

function findSolutionRootNodes(node: (ChildNode & Element1) | Document): Element1[] {
  return recursivelyFindNodes(node, ['data-problem-solution']).map((result) => result.node);
}

function booleanStringToTriState(str: string) {
  if (str.toLowerCase() === 'true') return Tristate.TRUE;
  if (str.toLowerCase() === 'false') return Tristate.FALSE;
  return Tristate.UNKNOWN;
}

function stringToQuadState(str: string) {
  if (str.toLowerCase() === 'true') return QuadState.TRUE;
  if (str.toLowerCase() === 'false') return QuadState.FALSE;
  if (str.toLowerCase() === 'any') return QuadState.ANY;
  return QuadState.UNKNOWN;
}

function getChoiceInfo(
  choiceNode: Element1,
  solNodeAttr: string,
  shouldSelectStr: string,
  idx: number
) {
  const feedbackNode = recursivelyFindNodes(choiceNode, [solNodeAttr])?.[0]?.node;
  const feedbackHtml = feedbackNode ? DomUtils.getOuterHTML(feedbackNode) : '';
  removeNodeWithAttrib(choiceNode, [solNodeAttr]);
  const shouldSelect = stringToQuadState(shouldSelectStr);
  const outerHTML = DomUtils.getOuterHTML(choiceNode);
  const optionId = `${idx}`;
  return { shouldSelect, value: { outerHTML }, feedbackHtml, optionId };
}

function getOptionSet(optionBlock: Element1, type: InputType): Option[] {
  const problemNodeAttr = type === InputType.MCQ ? 'data-problem-mc' : 'data-problem-sc';
  const solutionNodeAttr = problemNodeAttr + '-solution';
  return recursivelyFindNodes(optionBlock, [problemNodeAttr]).map(
    ({ node: choiceNode, attrVal: shouldSelectStr }, idx) =>
      getChoiceInfo(choiceNode, solutionNodeAttr, shouldSelectStr, idx)
  );
}

export function fillInValueToStartEndNum(value: string) {
  value = value.trim();
  if (value.startsWith('[')) value = value.slice(1);
  if (value.endsWith(']')) value = value.slice(0, -1);
  if (value.includes(',')) value = value.replace(',', '-');

  // Remove spaces from the range string
  const cleanedRange = value.replace(/\s/g, '');

  const regex = /^(-?[\d.]+)?-(-?[\d.]+)?$/;
  const match = cleanedRange.match(regex);

  if (!match) return { startNum: undefined, endNum: undefined };
  return { startNum: parseFloat(match[1]), endNum: parseFloat(match[2]) };
}

function getAnswerClass(node: Element1): FillInAnswerClass | undefined {
  const type = node.attribs['data-fillin-type'];
  const verdict = node.attribs['data-fillin-verdict']?.toLowerCase() === 'true';
  const value = node.attribs['data-fillin-value'];
  node.attribs['style'] = ''; // was {display: none}
  const feedbackHtml = DomUtils.getOuterHTML(node);
  switch (type) {
    case 'exact':
      return {
        type: FillInAnswerClassType.exact,
        verdict,
        exactMatch: value,
        feedbackHtml,
      };
    case 'numrange': {
      const { startNum, endNum } = fillInValueToStartEndNum(value);
      return {
        type: FillInAnswerClassType.numrange,
        verdict,
        startNum,
        endNum,
        feedbackHtml,
      };
    }
    case 'regex':
      return {
        type: FillInAnswerClassType.regex,
        verdict,
        regex: value,
        feedbackHtml,
      };
    default:
      return undefined;
  }
}

function getSubProblems(rootNode: Element1): SubProblemData[] {
  const rawAnswerclasses = recursivelyFindNodes(rootNode, ['data-problem-answerclass']);
  const subproblems: SubProblemData[] = [];
  for (const rawAnswerClass of rawAnswerclasses) {
    if (rawAnswerClass.attrVal === '') {
      if (rawAnswerClass.node?.attribs) {
        rawAnswerClass.node.attribs['id'] = getMMTCustomId(`nap_${subproblems.length}`);
      }
      subproblems.push({
        answerclasses: [],
        id: subproblems.length.toString(),
        solution: getProblemSolution(rawAnswerClass.node),
      });
      continue;
    }

    subproblems.at(-1)?.answerclasses.push({
      className: getAnswerClassId(rawAnswerClass.attrVal),
      description: '',
      title: DomUtils.textContent(rawAnswerClass.node),
      points: getPointsFromAnswerClass(rawAnswerClass.node),
      closed: false,
      isTrait: true,
    });
  }
  return subproblems;
}

function getAnswerClassId(attribute: string): string {
  const startIndex = attribute.indexOf('{');
  const endIndex = attribute.indexOf('}');
  if (startIndex == -1 || endIndex == -1) {
    return attribute;
  }
  return attribute.substring(startIndex, endIndex);
}

function getPointsFromAnswerClass(rawClass: Element1): number {
  const pointElemnt = recursivelyFindNodes(rawClass, ['data-problem-answerclass-pts'])[0];
  return Number(pointElemnt?.attrVal ?? '0');
}

function getFillInAnswerClasses(fillInSolNode: Element1): FillInAnswerClass[] {
  const answerClassNodes = recursivelyFindNodes(fillInSolNode, ['data-fillin-type']);
  if (!answerClassNodes?.length) {
    const value = DomUtils.textContent(fillInSolNode);
    if (!value) return [];
    if (value.startsWith('^') && value.endsWith('$')) {
      return [{ type: FillInAnswerClassType.regex, verdict: true, regex: value }];
    } else {
      return [{ type: FillInAnswerClassType.exact, verdict: true, exactMatch: value }];
    }
  }
  return answerClassNodes
    .map(({ node }) => getAnswerClass(node))
    .filter((x) => x) as FillInAnswerClass[];
}

function findInputs(problemRootNode: (ChildNode & Element1) | Document): Input[] {
  const rootProblemNodeMarkers = Object.keys(NODE_ATTRS_TO_TYPE);
  const inputNodes = recursivelyFindNodes(problemRootNode, rootProblemNodeMarkers);
  removeNodeWithAttrib(problemRootNode, rootProblemNodeMarkers);
  return inputNodes.map(({ node, attrName }, idx) => {
    const type = NODE_ATTRS_TO_TYPE[attrName] ?? InputType.FILL_IN;
    const inline = isInlineBlock(node);
    const ignoreForScoring = isIgnoredForScoring(node);
    node.attribs['id'] = getMMTCustomId(`ap_${idx}`);
    if ([InputType.MCQ, InputType.SCQ].includes(type)) {
      const options = getOptionSet(node, type);
      return { type, options, inline } as Input;
    } else {
      const fillInAnswerClasses = getFillInAnswerClasses(node);
      return { type, fillInAnswerClasses, inline, ignoreForScoring } as Input;
    }
  });
}

function getProblemPoints(rootNode: Element1) {
  const pointsStr = rootNode?.attribs?.['data-problem-points'];
  if (!pointsStr) return 1;
  const parsedFloat = parseFloat(pointsStr);
  if (isNaN(parsedFloat) || parsedFloat === 0) return 1; // Unfortunately, the default points are returned as "0". This has to be treated as 1 point.
  if (parsedFloat < 1e-3) return 0; // A way to remove a problem from grading.
  return parsedFloat;
}

function getProblemHeader(rootNode: Element1) {
  const header = recursivelyFindNodes(rootNode, ['data-problem-title'])?.[0]?.node;
  return header ? DomUtils.getOuterHTML(header) : '';
}

function getProblemSolution(rootNode?: Element1): string {
  if (!rootNode) return '';
  const solutionNodes = findSolutionRootNodes(rootNode);
  return solutionNodes.map((node) => DomUtils.getOuterHTML(node)).join('\n');
}

export function getProblem(htmlStr: string, problemUrl = '') {
  const htmlDoc = parseDocument(htmlStr);
  const problemRootNode = findProblemRootNode(htmlDoc);
  problemRootNode.attribs[PROBLEM_PARSED_MARKER] = 'true';
  const points = getProblemPoints(problemRootNode);
  const header = getProblemHeader(problemRootNode);
  const subProblemData = getSubProblems(problemRootNode);

  if (!problemRootNode) {
    return {
      header: '',
      objectives: '',
      preconditions: '',
      inputs: [],
      subProblemData: [],
      points: 0,
      statement: { outerHTML: `<span>Not found: ${problemUrl}</span>` },
    } as Problem;
  }

  removeNodeWithAttrib(problemRootNode, [
    'data-problem-title',
    'data-problem-solution',
    'data-problem-g-note',
    'data-problem-minutes',
  ]);
  const inputs = findInputs(problemRootNode);
  const problem = {
    header,
    objectives: problemRootNode?.attribs?.['data-problem-objectives'] ?? '',
    preconditions: problemRootNode?.attribs?.['data-problem-preconditions'] ?? '',
    statement: { outerHTML: DomUtils.getOuterHTML(problemRootNode) }, // The mcb block is already marked display:none.
    inputs,
    subProblemData,
    points,
  } as Problem;
  return problem;
}

export function getQuizPhase(q: QuizWithStatus) {
  if (q.manuallySetPhase && q.manuallySetPhase !== Phase.UNSET) {
    return q.manuallySetPhase;
  }
  const now = Date.now();
  if (now < q.quizStartTs) return Phase.NOT_STARTED;
  if (now < q.quizEndTs) return Phase.STARTED;
  if (now < q.feedbackReleaseTs) return Phase.ENDED;
  return Phase.FEEDBACK_RELEASED;
}

export function hackAwayProblemId(quizHtml: string) {
  if (!quizHtml) return quizHtml;
  return quizHtml.replace('Problem 0.1', '').replace('Aufgabe 0.1', '');
}

export const DEFAULT_ANSWER_CLASSES: Readonly<AnswerClass[]> = [
  {
    className: 'ac-default-01',
    title: 'Entirely correct',
    description: "Student's answer is correct and complete regarding all aspects.",
    points: 1000,
    closed: true,
    isTrait: false,
  },
  {
    className: 'ac-default-02',
    title: 'Entirely wrong',
    description: "Student's answer is completely unrelated to expected answers.",
    points: 0,
    closed: true,
    isTrait: false,
  },
  {
    className: 'ac-default-06',
    title: 'Correct, but...',
    description: "Student's answer is mostly correct.",
    isTrait: false,
    points: 1000,
    closed: false,
  },
  {
    className: 'ac-default-07',
    title: 'Wrong, but...',
    description: "Student's answer is mostly wrong.",
    isTrait: false,
    points: 0,
    closed: false,
  },
  {
    className: 'ac-default-09',
    title: 'Minor errors',
    description: "Student's answer contains minor errors.",
    closed: false,
    isTrait: true,
    points: -0.5,
  },
  {
    className: 'ac-default-10',
    title: 'Argumentation flawed',
    description: "Student's argumentation is unsound/imprecise.",
    closed: false,
    isTrait: true,
    points: -0.5,
  },
  {
    className: 'ac-default-11',
    title: 'Syntax errors',
    description: 'Student uses syntax incorrectly.',
    closed: false,
    isTrait: true,
    points: -0.5,
  },
  {
    className: 'ac-default-12',
    title: 'Formal errors',
    description: "Student's answer misses formal requirements.",
    closed: false,
    isTrait: true,
    points: -0.5,
  },
] as const;
