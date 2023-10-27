import {
  Option,
  Phase,
  Problem,
  ProblemType,
  Quiz,
  Tristate,
  UserResponse,
} from '@stex-react/api';
import { getMMTCustomId } from '@stex-react/utils';
import { ChildNode, Document, Element } from 'domhandler';
import { DomUtils, parseDocument } from 'htmlparser2';

function filledInProblemPoints(problem: Problem, filledIn?: string) {
  if (!problem.fillInSolution?.length) return undefined;
  if (!filledIn?.length) return 0;
  return filledIn.toLowerCase() === problem.fillInSolution?.toLowerCase()
    ? problem.points
    : 0;
}

function singleAnswerMCQPoints(problem: Problem, singleOptionIdxs?: number[]) {
  if (!singleOptionIdxs?.length) return 0;
  let numCorrect = 0;
  let numIncorrect = 0;
  let numUndefined = 0;
  const { inlineOptionSets, options } = problem;
  [...(inlineOptionSets || []), options || []].forEach((optionSet, idx) => {
    if (!optionSet?.length) return;
    const correctOption = optionSet.findIndex(
      (o) => o.shouldSelect === Tristate.TRUE
    );
    if (correctOption === -1) numUndefined++;
    else if (singleOptionIdxs[idx] == correctOption) numCorrect++;
    else numIncorrect++;
  });
  if (numUndefined > 0) return undefined;
  return (numCorrect / (numCorrect + numIncorrect)) * problem.points;
}

function multiAnswerMCQPoints(
  problem: Problem,
  multiOptionIdx?: { [index: number]: boolean }
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

function assignTagsToScbBlocks(
  node: (ChildNode & Element) | Document,
  tagNo: number
) {
  if (node instanceof Element) {
    if (node.attribs['data-problem-scb-inline'] === 'true') {
      node.attribs['id'] = getMMTCustomId(`${tagNo++}`);
    }
  }

  for (const child of node.childNodes ?? []) {
    if (child instanceof Element) {
      tagNo = assignTagsToScbBlocks(child, tagNo);
    }
  }
  return tagNo;
}

function findProblemRootNode(node: (ChildNode & Element) | Document) {
  return recursivelyFindNodes(node, 'data-problem')?.[0]?.node;
}

function booleanStringToTriState(str: string) {
  if (str === 'true') return Tristate.TRUE;
  if (str === 'false') return Tristate.FALSE;
  return Tristate.UNKNOWN;
}

function getChoiceInfo(
  choiceNode: Element,
  type: ProblemType,
  shouldSelectStr: string
) {
  const solNodeAttr =
    type === ProblemType.MULTI_CHOICE_MULTI_ANSWER
      ? 'data-problem-mc-solution'
      : 'data-problem-sc-solution';
  const feedbackNode = recursivelyFindNodes(choiceNode, solNodeAttr)?.[0]?.node;
  const feedbackHtml = feedbackNode ? DomUtils.getOuterHTML(feedbackNode) : '';
  removeNodeWithAttrib(choiceNode, solNodeAttr);
  const shouldSelect = booleanStringToTriState(shouldSelectStr);
  const outerHTML = DomUtils.getOuterHTML(choiceNode);
  return { shouldSelect, value: { outerHTML }, feedbackHtml };
}

function findChoiceInfo(problemRootNode: (ChildNode & Element) | Document): {
  inlineOptionSets: Option[][];
  options: Option[];
  type: ProblemType;
} {
  const mcbNode = recursivelyFindNodes(problemRootNode, 'data-problem-mcb')?.[0]
    ?.node;
  const scbNodes = recursivelyFindNodes(
    problemRootNode,
    'data-problem-scb'
  )?.map((n) => n?.node);
  if (!mcbNode && !scbNodes?.length) {
    return { inlineOptionSets: [], options: undefined, type: undefined } as any;
  }

  let type: ProblemType;
  if (mcbNode) {
    type = ProblemType.MULTI_CHOICE_MULTI_ANSWER;
    removeNodeWithAttrib(problemRootNode, 'data-problem-mcb');
  } else {
    type = ProblemType.MULTI_CHOICE_SINGLE_ANSWER;
    assignTagsToScbBlocks(problemRootNode, 0);
    removeNodeWithAttrib(problemRootNode, 'data-problem-scb');
  }
  const optionBlocks = mcbNode ? [mcbNode] : scbNodes;
  const problemNodeAttr = mcbNode ? 'data-problem-mc' : 'data-problem-sc';

  const allOptionSets = optionBlocks.map((optionBlock) =>
    recursivelyFindNodes(optionBlock, problemNodeAttr).map(
      ({ node: choiceNode, attrVal: shouldSelectStr }) =>
        getChoiceInfo(choiceNode, type, shouldSelectStr)
    )
  );

  let options = allOptionSets[0];
  const inlineOptionSets: Option[][] = [];
  if (type === ProblemType.MULTI_CHOICE_SINGLE_ANSWER) {
    options = [];
    scbNodes?.forEach((scbNode, i) => {
      if (scbNode.attribs['data-problem-scb-inline'] === 'true') {
        inlineOptionSets.push(allOptionSets[i]);
      } else {
        options = allOptionSets[i];
      }
    });
  }

  return { inlineOptionSets, options, type };
}

export function getAllOptionSets(problem: Problem) {
  const { inlineOptionSets, options, type } = problem;
  if (type != ProblemType.MULTI_CHOICE_SINGLE_ANSWER) return [];
  const otherOptions = inlineOptionSets || [];
  const optionSets = options?.length
    ? [...otherOptions, options]
    : otherOptions;
  return optionSets;
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
  return isNaN(parsedInt) || parsedInt === 0 ? 1 : parsedInt;
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
  const { inlineOptionSets, options, type } = findChoiceInfo(
    problemRootNode
  ) as any;
  const fillInSolution = findFillInSolution(problemRootNode);

  const problem = {
    type: type || ProblemType.FILL_IN,
    statement: { outerHTML: DomUtils.getOuterHTML(problemRootNode) }, // The mcb block is already marked display:none.
    inlineOptionSets,
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
