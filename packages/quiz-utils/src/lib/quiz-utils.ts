import {
  Option,
  Phase,
  Problem,
  Quiz,
  Tristate,
  ProblemResponse,
  InputType,
  Input,
} from '@stex-react/api';
import { getMMTCustomId } from '@stex-react/utils';
import { ChildNode, Document, Element } from 'domhandler';
import { DomUtils, parseDocument } from 'htmlparser2';

const NODE_ATTRS_TO_TYPE: { [attrName: string]: InputType } = {
  'data-problem-mcb': InputType.MCQ,
  'data-problem-scb': InputType.SCQ,
  'data-problem-fillinsol': InputType.FILL_IN,
};

export const PROBLEM_PARSED_MARKER = 'problem-parsed';

export function isFillInInputCorrect(expected?: string, actual?: string) {
  if (!expected?.length) return Tristate.UNKNOWN;
  if (!actual) return Tristate.FALSE;
  return expected.toLowerCase().trim() === actual.toLowerCase().trim()
    ? Tristate.TRUE
    : Tristate.FALSE;
}

function isSCQCorrect(options?: Option[], singleOptionIdx?: string) {
  const correctOption = (options || []).find(
    (o) => o.shouldSelect === Tristate.TRUE
  );
  if (!correctOption) return Tristate.UNKNOWN;
  return correctOption.optionId === singleOptionIdx
    ? Tristate.TRUE
    : Tristate.FALSE;
}

function isMCQCorrect(
  options?: Option[],
  multiOptionIdx?: { [index: number]: boolean }
) {
  if (!options?.length) return Tristate.UNKNOWN;
  if (!multiOptionIdx) return Tristate.FALSE;
  const anyUnknown = options.some(
    (option) => option.shouldSelect === Tristate.UNKNOWN
  );
  if (anyUnknown) return Tristate.UNKNOWN;
  for (const [idx, option] of options.entries() ?? []) {
    const isSelected = multiOptionIdx?.[idx] ?? false;
    const shouldSelect = option.shouldSelect === Tristate.TRUE;
    if (isSelected !== shouldSelect) return Tristate.FALSE;
  }
  return Tristate.TRUE;
}

export function getPoints(problem: Problem, response?: ProblemResponse) {
  if (!response) return 0;
  const perInputCorrectness: Tristate[] = problem.inputs.map((input, idx) => {
    const resp = response?.responses?.[idx];
    const { type, fillInSolution, options } = input;
    if (type !== input.type) {
      console.error(
        `Input [${idx}] (${type}) has unexpected response: ${resp.type}`
      );
      return Tristate.UNKNOWN;
    }
    if (input.type === InputType.FILL_IN) {
      return isFillInInputCorrect(fillInSolution, resp.filledInAnswer);
    } else if (input.type === InputType.MCQ) {
      return isMCQCorrect(options, resp.multipleOptionIdxs);
    } else if (input.type === InputType.SCQ) {
      return isSCQCorrect(options, resp.singleOptionIdx);
    } else {
      console.error(`Unknown input type: ${input.type}`);
      return Tristate.UNKNOWN;
    }
  });
  if (perInputCorrectness.some((s) => s === Tristate.UNKNOWN)) return undefined;
  const totalCorrect = perInputCorrectness.reduce(
    (s, a) => s + (a === Tristate.TRUE ? 1 : 0),
    0
  );

  return (problem.points * totalCorrect) / problem.inputs.length;
}

function recursivelyFindNodes(
  node: Document | (ChildNode & Element),
  attrNames: string[]
): { node: Element; attrName: string; attrVal: any }[] {
  if (node instanceof Element) {
    for (const attrName of attrNames) {
      const attrVal = node.attribs[attrName];
      if (attrVal) return [{ node, attrName, attrVal }];
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

function removeNodeWithAttrib(
  node: (ChildNode & Element) | Document,
  attrNames: string[]
) {
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
  return ['data-problem-scb-inline', 'data-problem-fillInSol-inline'].some(
    (attrib) => node.attribs[attrib] === 'true'
  );
}

function findProblemRootNode(node: (ChildNode & Element) | Document) {
  return recursivelyFindNodes(node, ['data-problem'])?.[0]?.node;
}

function booleanStringToTriState(str: string) {
  if (str === 'true') return Tristate.TRUE;
  if (str === 'false') return Tristate.FALSE;
  return Tristate.UNKNOWN;
}

function getChoiceInfo(
  choiceNode: Element,
  solNodeAttr: string,
  shouldSelectStr: string,
  idx: number
) {
  const feedbackNode = recursivelyFindNodes(choiceNode, [solNodeAttr])?.[0]
    ?.node;
  const feedbackHtml = feedbackNode ? DomUtils.getOuterHTML(feedbackNode) : '';
  removeNodeWithAttrib(choiceNode, [solNodeAttr]);
  const shouldSelect = booleanStringToTriState(shouldSelectStr);
  const outerHTML = DomUtils.getOuterHTML(choiceNode);
  const optionId = `${idx}`;
  return { shouldSelect, value: { outerHTML }, feedbackHtml, optionId };
}

function getOptionSet(optionBlock: Element, type: InputType): Option[] {
  const problemNodeAttr =
    type === InputType.MCQ ? 'data-problem-mc' : 'data-problem-sc';
  const solutionNodeAttr = problemNodeAttr + '-solution';
  return recursivelyFindNodes(optionBlock, [problemNodeAttr]).map(
    ({ node: choiceNode, attrVal: shouldSelectStr }, idx) =>
      getChoiceInfo(choiceNode, solutionNodeAttr, shouldSelectStr, idx)
  );
}

function findInputs(
  problemRootNode: (ChildNode & Element) | Document
): Input[] {
  const rootProblemNodeMarkers = Object.keys(NODE_ATTRS_TO_TYPE);
  const inputNodes = recursivelyFindNodes(
    problemRootNode,
    rootProblemNodeMarkers
  );
  removeNodeWithAttrib(problemRootNode, rootProblemNodeMarkers);
  return inputNodes.map(({ node, attrName }, idx) => {
    const type = NODE_ATTRS_TO_TYPE[attrName] ?? InputType.FILL_IN;
    const inline = isInlineBlock(node);
    node.attribs['id'] = getMMTCustomId(`${idx}`);
    if ([InputType.MCQ, InputType.SCQ].includes(type)) {
      const options = getOptionSet(node, type);
      return { type, options, inline } as Input;
    } else {
      const fillInSolution = DomUtils.textContent(node);
      return { type, fillInSolution, inline } as Input;
    }
  });
}

function getProblemPoints(rootNode: Element) {
  const pointsStr = rootNode?.attribs?.['data-problem-points'];
  if (!pointsStr) return 1;
  const parsedInt = parseInt(pointsStr, 10);
  return isNaN(parsedInt) || parsedInt === 0 ? 1 : parsedInt;
}

function getProblemHeader(rootNode: Element) {
  const header = recursivelyFindNodes(rootNode, ['data-problem-title'])?.[0]
    ?.node;
  return header ? DomUtils.getOuterHTML(header) : '';
}

export function getProblem(htmlStr: string, problemUrl: string) {
  const htmlDoc = parseDocument(htmlStr);
  const problemRootNode = findProblemRootNode(htmlDoc);
  problemRootNode.attribs[PROBLEM_PARSED_MARKER] = "true";
  const points = getProblemPoints(problemRootNode);
  const header = getProblemHeader(problemRootNode);
  if (!problemRootNode) {
    return {
      header: '',
      objectives: '',
      preconditions: '',
      inputs: [],
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
    preconditions:
      problemRootNode?.attribs?.['data-problem-preconditions'] ?? '',
    statement: { outerHTML: DomUtils.getOuterHTML(problemRootNode) }, // The mcb block is already marked display:none.
    inputs,
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
  if(!quizHtml) return quizHtml;
  return quizHtml.replace('Problem 0.1', '').replace('Aufgabe 0.1', '');
}
