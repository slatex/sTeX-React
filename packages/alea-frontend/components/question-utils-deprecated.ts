import { Option, Problem, ProblemType, Tristate } from '@stex-react/api';
import { convertHtmlStringToPlain } from '@stex-react/utils';

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

function findChoiceInfo(
  problemRootNode: Element | Document
): { options: Option[]; type: ProblemType } | undefined {
  const mcbNode = recursivelyFindNodes(problemRootNode, 'data-problem-mcb')?.[0]
    ?.node;
  const scbNode = recursivelyFindNodes(problemRootNode, 'data-problem-scb')?.[0]
    ?.node;
  if (!mcbNode && !scbNode) return { options: undefined, type: undefined };

  let type: ProblemType;
  if (mcbNode) {
    type = ProblemType.MULTI_CHOICE_MULTI_ANSWER;
    removeNodeWithAttrib(problemRootNode, 'data-problem-mcb');
  } else if (scbNode) {
    type = ProblemType.MULTI_CHOICE_SINGLE_ANSWER;
    removeNodeWithAttrib(problemRootNode, 'data-problem-scb');
  }
  const optionBlock = scbNode ?? mcbNode;
  const problemNodeAttr = scbNode ? 'data-problem-sc' : 'data-problem-mc';
  const solutionNodeAttr = problemNodeAttr + '-solution';

  const options = recursivelyFindNodes(optionBlock, problemNodeAttr).map(
    ({ node, attrVal }) => {
      const feedbackHtml = recursivelyFindNodes(node, solutionNodeAttr)?.[0]
        ?.node.outerHTML;
      removeNodeWithAttrib(node, solutionNodeAttr);
      const shouldSelect =
        attrVal === 'true'
          ? Tristate.TRUE
          : attrVal === 'false'
          ? Tristate.FALSE
          : Tristate.UNKNOWN;
      return { shouldSelect, value: node, feedbackHtml };
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

  return convertHtmlStringToPlain(fillInSolution.outerHTML);
}

// Use the version that uses htmlparser2 instead. That can be used on both frontend and server.
export function getProblem(htmlDoc: Document, problemUrl: string) {
  const problemRootNode = findProblemRootNode(htmlDoc);
  if (!problemRootNode) {
    return {
      type: ProblemType.FILL_IN,
      statement: { outerHTML: `<span>Not found: ${problemUrl}</span>` },
    } as Problem;
  }
  removeNodeWithAttrib(problemRootNode, 'data-problem-solution');
  removeNodeWithAttrib(problemRootNode, 'data-problem-g-note');
  removeNodeWithAttrib(problemRootNode, 'data-problem-points');
  removeNodeWithAttrib(problemRootNode, 'data-problem-minutes');
  const { options, type } = findChoiceInfo(problemRootNode);
  const fillInSolution = findFillInSolution(problemRootNode);

  const problem: Problem = {
    type: type || ProblemType.FILL_IN,
    statement: problemRootNode, // The mcb block is already marked display:none.
    options,
    fillInSolution,
  };
  console.log(problem);
  return problem;
}
