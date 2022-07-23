import { getOuterHTML } from 'domutils';

export interface IndexNode {
  hash: string;
  parentNode: IndexNode|undefined;
  childNodes: Map<string, IndexNode>;
  title: string;
}

export const TOP_LEVEL: IndexNode = {
  hash: '',
  parentNode: undefined,
  childNodes: new Map(),
  title: 'HIDE ME',
};

function convertToPlain(html: any) {
  // Create a new div element
  const tempDivElement = document.createElement('div');
  // Set the HTML content with the given value
  tempDivElement.innerHTML = getOuterHTML(html);
  // Retrieve the text property of the element
  return tempDivElement.textContent || tempDivElement.innerText || '';
}

function addToNode(node: IndexNode, context: string[], title: string) {
  if (!node || !context?.length) return;
  console.log(title);
  const first = context[0];
  const rest = context.slice(1);

  const childNode = node.childNodes.get(first);
  if (childNode) {
    if (rest.length === 0) {
      // overwriting
      childNode.title = title;
    } else {
      addToNode(childNode, rest, title);
    }
  } else {
    const t = rest.length === 0 ? title : 'unknown';
    const newNode: IndexNode = {
      hash: first,
      parentNode: node,
      childNodes: new Map<string, IndexNode>(),
      title: t,
    };
    if (rest.length) addToNode(newNode, rest, title);
    node.childNodes.set(first, newNode);
  }
}

export function reportContext(context: string[], title: any) {
  if (!title) return;
  const titleText = convertToPlain(title);
  if (titleText.startsWith('http')) return;
  addToNode(TOP_LEVEL, context, titleText);
  console.log(TOP_LEVEL.childNodes);
}
