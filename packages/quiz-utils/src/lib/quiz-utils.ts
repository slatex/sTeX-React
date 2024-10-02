import {
  AnswerClass,
  FillInAnswerClass,
  FillInAnswerClassType,
  Input,
  InputType,
  Option,
  Phase,
  Problem,
  ProblemResponse,
  QuadState,
  Quiz,
  SubProblemData,
  Tristate,
} from '@stex-react/api';
import { getMMTCustomId, truncateString } from '@stex-react/utils';
import { ChildNode, Document, Element } from 'domhandler';
import { copyFileSync } from 'fs';
import { DomHandler, DomUtils, Parser, parseDocument } from 'htmlparser2';

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

export function getPoints(problem: Problem, response?: ProblemResponse) {
  if (!response) return 0;
  const perInputCorrectnessQuotient: number[] = problem.inputs
    .map((input, idx) => {
      const resp = response?.responses?.[idx];
      const { type, fillInAnswerClasses, options } = input;
      if (type !== input.type) {
        console.error(`Input [${idx}] (${type}) has unexpected response: ${resp.type}`);
        return NaN;
      }
      if (input.ignoreForScoring) return null;
      if (input.type === InputType.FILL_IN) {
        return fillInCorrectnessQuotient(fillInAnswerClasses, resp.filledInAnswer);
      } else if (input.type === InputType.MCQ) {
        return mcqCorrectnessQuotient(options, resp.multipleOptionIdxs);
      } else if (input.type === InputType.SCQ) {
        return scqCorrectnessQuotient(options, resp.singleOptionIdx);
      } else {
        console.error(`Unknown input type: ${input.type}`);
        return NaN;
      }
    })
    .filter((v) => v !== null) as number[];

  const numGradable = perInputCorrectnessQuotient.length;
  if (numGradable === 0) return 0;
  if (perInputCorrectnessQuotient.some((s) => isNaN(s))) return undefined;
  const totalCorrect = perInputCorrectnessQuotient.reduce((s, a) => s + a, 0);

  return (problem.points * totalCorrect) / numGradable;
}

function recursivelyFindNodes(
  node: Document | (ChildNode & Element),
  attrNames: string[]
): { node: Element; attrName: string; attrVal: any }[] {
  if (node instanceof Element) {
    for (const attrName of attrNames) {
      const attrVal = node.attribs[attrName];
      if (attrVal || attrVal === '') return [{ node, attrName, attrVal }];
    }
  }
  const foundList: { node: Element; attrName: string; attrVal: any }[] = [];
  const children = node.childNodes;
  for (const child of children || []) {
    //const child = children.item(i);
    if (child instanceof Element) {
      const subFoundList = recursivelyFindNodes(child, attrNames);
      if (subFoundList?.length) foundList.push(...subFoundList);
    }
  }
  return foundList;
}

function removeNodeWithAttrib(node: (ChildNode & Element) | Document, attrNames: string[]) {
  if (node instanceof Element) {
    for (const attrName of attrNames) {
      const attrVal = node.attribs[attrName];
      if (attrVal) {
        node.attribs['style'] = 'display: none';
      }
    }
  }

  for (const child of node.childNodes ?? []) {
    // const child = children.item(i);
    if (child instanceof Element) {
      removeNodeWithAttrib(child, attrNames);
    }
  }
}

function isInlineBlock(node: Element) {
  return node.attribs['data-problem-scb-inline'] === 'true';
}

function isIgnoredForScoring(node: Element) {
  return node.attribs['data-problem-ignore-scoring'] === 'true';
}

function findProblemRootNode(node: (ChildNode & Element) | Document) {
  return recursivelyFindNodes(node, ['data-problem'])?.[0]?.node;
}

function findSolutionRootNodes(node: (ChildNode & Element) | Document): Element[] {
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
  choiceNode: Element,
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

function getOptionSet(optionBlock: Element, type: InputType): Option[] {
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

function getAnswerClass(node: Element): FillInAnswerClass | undefined {
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
function getSubProblems(rootNode: Element): SubProblemData[] {
  const rawAnswerclasses = recursivelyFindNodes(rootNode, ['data-problem-answerclass']);
  const subproblems: SubProblemData[] = [];
  for (const rawAnswerClass of rawAnswerclasses) {
    if (rawAnswerClass.attrVal === '') {
      subproblems.push({ answerclasses: [], solution: getProblemSolution(rawAnswerClass.node) });
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
function getPointsFromAnswerClass(rawClass: Element): number {
  const pointElemnt = recursivelyFindNodes(rawClass, ['data-problem-answerclass-pts'])[0];
  return Number(pointElemnt?.attrVal ?? '0');
}
function getFillInAnswerClasses(fillInSolNode: Element): FillInAnswerClass[] {
  const answerClassNodes = recursivelyFindNodes(fillInSolNode, ['data-fillin-type']);
  if (!answerClassNodes?.length) {
    const exactMatch = DomUtils.textContent(fillInSolNode);
    if (!exactMatch) return [];
    return [{ type: FillInAnswerClassType.exact, verdict: true, exactMatch }];
  }
  return answerClassNodes
    .map(({ node }) => getAnswerClass(node))
    .filter((x) => x) as FillInAnswerClass[];
}

function findInputs(problemRootNode: (ChildNode & Element) | Document): Input[] {
  const rootProblemNodeMarkers = Object.keys(NODE_ATTRS_TO_TYPE);
  const inputNodes = recursivelyFindNodes(problemRootNode, rootProblemNodeMarkers);
  removeNodeWithAttrib(problemRootNode, rootProblemNodeMarkers);
  return inputNodes.map(({ node, attrName }, idx) => {
    const type = NODE_ATTRS_TO_TYPE[attrName] ?? InputType.FILL_IN;
    const inline = isInlineBlock(node);
    const ignoreForScoring = isIgnoredForScoring(node);
    node.attribs['id'] = getMMTCustomId(`${idx}`);
    if ([InputType.MCQ, InputType.SCQ].includes(type)) {
      const options = getOptionSet(node, type);
      return { type, options, inline } as Input;
    } else {
      const fillInAnswerClasses = getFillInAnswerClasses(node);
      return { type, fillInAnswerClasses, inline, ignoreForScoring } as Input;
    }
  });
}

function getProblemPoints(rootNode: Element) {
  const pointsStr = rootNode?.attribs?.['data-problem-points'];
  if (!pointsStr) return 1;
  const parsedFloat = parseFloat(pointsStr);
  if (isNaN(parsedFloat) || parsedFloat === 0) return 1; // Unfortunately, the default points are returned as "0". This has to be treated as 1 point.
  if (parsedFloat < 1e-3) return 0; // A way to remove a problem from grading.
  return parsedFloat;
}

function getProblemHeader(rootNode: Element) {
  const header = recursivelyFindNodes(rootNode, ['data-problem-title'])?.[0]?.node;
  return header ? DomUtils.getOuterHTML(header) : '';
}

function getProblemSolution(rootNode?: Element): string {
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

  const subproblems = getSubProblems(problemRootNode);
  console.log(problemUrl);
  if (!problemRootNode) {
    return {
      header: '',
      objectives: '',
      preconditions: '',
      inputs: [],
      subProblemDatas: [],
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
    subProblemDatas: subproblems,
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

export function hackAwayProblemId(quizHtml: string) {
  if (!quizHtml) return quizHtml;
  return quizHtml.replace('Problem 0.1', '').replace('Aufgabe 0.1', '');
}

const ANSWER_ATTRIBS_TO_REDACT = ['data-problem-sc', 'data-problem-mc'];

const ATTRIBS_TO_REMOVE = [
  'data-overlay-link-click',
  'data-overlay-link-hover',
  'data-highlight-parent',
];

const ATTRIBS_OF_ANSWER_ELEMENTS = ['data-problem-sc-solution', 'data-problem-mc-solution'];

const ATTRIBS_OF_PARENTS_OF_ANSWER_ELEMENTS = ['data-problem-fillinsol'];

export function removeAnswerInfo(problem: string) {
  const handler = new DomHandler();
  const parser = new Parser(handler);
  parser.write(problem);
  parser.end();

  // Traverse and modify the parsed DOM to remove nodes with 'solution' attribute
  const traverse = (node: any) => {
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
    const removeChildren = ATTRIBS_OF_PARENTS_OF_ANSWER_ELEMENTS.some(
      (attrib) => node.attribs?.[attrib]
    );
    if (removeChildren) {
      node.children = [];
      return node;
    }

    // Recursively traverse and process children
    node.children = node.children?.map(traverse).filter(Boolean);
    return node;
  };

  const modifiedDom = handler.dom.map((n) => traverse(n));
  // Convert the modified DOM back to HTML
  return DomUtils.getOuterHTML(modifiedDom);
}

export const defaultAnswerClasses: AnswerClass[] = [
  {
    className: 'ac-defualt-01',
    title: 'Entirely correct',
    description: "Student's answer is correct and complete regarding all aspects.",
    points: 1000,
    closed: true,
    isTrait: false,
  },
  {
    className: 'ac-defualt-02',
    title: 'Entirely wrong',
    description: "Student's answer is completely unrelated to expected answers.",
    points: 0,
    closed: true,
    isTrait: false,
  },
  {
    className: 'ac-defualt-03',
    title: 'Empty',
    description: 'Student has left this question entirely or mostly blank.',
    points: 0,
    closed: true,
    isTrait: false,
  },
  {
    className: 'ac-defualt-04',
    title: 'Crossed out',
    description: 'Student has crossed out all answers.',

    points: 0,
    closed: true,
    isTrait: false,
  },
  {
    className: 'ac-defualt-05',
    title: 'Illegible',
    description: "Student's answer to this question cannot be deciphered despite honest effort.",

    points: 0,
    closed: true,
    isTrait: false,
  },
  {
    className: 'ac-defualt-06',
    title: 'Correct, but...',
    description: "Student's answer is mostly correct.",
    isTrait: false,
    points: 1000,
    closed: false,
  },
  {
    className: 'ac-defualt-07',
    title: 'Wrong, but...',
    description: "Student's answer is mostly wrong.",
    isTrait: false,
    points: 0,
    closed: false,
  },
  {
    className: 'ac-defualt-08',
    title: 'Abandoned',
    description: 'Abandoned',
    isTrait: false,
    points: 0,
    closed: false,
  },
  {
    className: 'ac-defualt-09',
    title: 'Minor errors',
    description: "Student's answer contains minor errors.",
    closed: false,
    isTrait: true,
    points: -0.5,
  },
  {
    className: 'ac-defualt-10',
    title: 'Argumentation flawed',
    description: "Student's argumentation is unsound/imprecise.",
    closed: false,
    isTrait: true,
    points: -0.5,
  },
  {
    className: 'ac-defualt-11',
    title: 'Syntax errors',
    description: 'Student uses syntax incorrectly.',
    closed: false,
    isTrait: true,
    points: -0.5,
  },
  {
    className: 'ac-defualt-12',
    title: 'Formal errors',
    description: "Student's answer misses formal requirements.",
    closed: false,
    isTrait: true,
    points: -0.5,
  },
];
