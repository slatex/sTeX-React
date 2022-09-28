export interface IndexNode {
  hash: string;
  parentNode: IndexNode | undefined;
  childNodes: Map<string, IndexNode>;
  title: string;
}

export const TOP_LEVEL: IndexNode = {
  hash: '',
  parentNode: undefined,
  childNodes: new Map(),
  title: 'HIDE ME',
};

export const SEPARATOR_inDocPath = '.';
export let INDEX_UPDATE_COUNT = 0;

let REF_MAP = new Map<string, HTMLElement>();
let COMPLETED_SCROLL: string | undefined = undefined;
let PENDING_SCROLL: string | undefined = undefined;

function addToNode(node: IndexNode, context: string[], title: string) {
  if (!title.trim().length || title.startsWith('http')) return;
  if (!node || !context?.length) return;
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

function addRef(context: string[], ref?: HTMLElement) {
  if (!ref) return;

  const key = context.join(SEPARATOR_inDocPath);
  REF_MAP.set(key, ref);
  // Trigger scroll to newly created element.
  if (PENDING_SCROLL?.includes(key) && !COMPLETED_SCROLL?.includes(key)) {
    ref.scrollIntoView({ behavior: 'auto' });
    COMPLETED_SCROLL = key;
    if (COMPLETED_SCROLL === PENDING_SCROLL) {
      // Scroll again to the ref, in case the layout has shifted due loading
      // of other documents. And mark the scroll as done.
      setTimeout(() => ref.scrollIntoView({ behavior: 'auto' }), 2000);
      COMPLETED_SCROLL = PENDING_SCROLL = undefined;
    }
  }
}

export function reportIndexInfo(
  context: string[],
  titleText: string,
  ref?: HTMLElement
) {
  addRef(context, ref);
  addToNode(TOP_LEVEL, context, titleText);
  INDEX_UPDATE_COUNT++; // Can optimize this increment.
}

export function resetIndexInfo() {
  TOP_LEVEL.childNodes = new Map();
  // TODO: Resetting happens at a time which causes scroall-at-load to be deleted.
  // So we have commented out this line.
  //COMPLETED_SCROLL = PENDING_SCROLL = undefined;
  REF_MAP = new Map<string, HTMLElement>();
}

function setPendingScroll(pending: string, completed?: string) {
  PENDING_SCROLL = pending;
  COMPLETED_SCROLL = completed;
  if (PENDING_SCROLL === COMPLETED_SCROLL) {
    PENDING_SCROLL = COMPLETED_SCROLL = undefined;
  }
}

export function scrollToClosestAncestorAndSetPending(sectionHashes: string[]) {
  const fullKey = sectionHashes.join(SEPARATOR_inDocPath);
  while (sectionHashes.length) {
    const key = sectionHashes.join(SEPARATOR_inDocPath);
    const ref = REF_MAP.get(key);
    if (ref) {
      // console.log(`Scroll: ${key}`);
      ref.scrollIntoView({ behavior: 'auto' });
      if (key !== fullKey) setPendingScroll(fullKey, key);
      return;
    }
    sectionHashes.pop();
  }
  setPendingScroll(fullKey, undefined);
}
