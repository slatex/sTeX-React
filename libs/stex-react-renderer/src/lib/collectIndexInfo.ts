export enum TOCNodeType {
  SECTION,
  FILE,
}

export interface TOCNode {
  type: TOCNodeType;
  parentNode?: TOCNode;
  childNodes: Map<string, TOCNode>;
}
export interface TOCSectionNode extends TOCNode {
  id: string;
  title: string;
}

export interface TOCFileNode extends TOCNode {
  hash: string;
  archive: string;
  filepath: string;
}

export const SEPARATOR_inDocPath = '.';

let REF_MAP = new Map<string, HTMLElement>();
let COMPLETED_SCROLL: string | undefined = undefined;
let PENDING_SCROLL: string | undefined = undefined;

export function reportIndexInfo(context: string[], ref?: HTMLElement) {
  if (!ref) return;

  const key = context.join(SEPARATOR_inDocPath);
  //console.log(`Adding ref: ${context.join(',')}`);
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

export function resetIndexInfo() {
  // TODO: Resetting happens at a time which causes scroall-at-load to be deleted.
  // So we have commented out this line.
  //COMPLETED_SCROLL = PENDING_SCROLL = undefined;
  REF_MAP = new Map<string, HTMLElement>();
}

export interface ScrollInfo {
  fileHashes: string[];
  sectionId?: string;
}

export function getScrollInfo(inDocPath: string): ScrollInfo {
  if (!inDocPath?.length) return { fileHashes: [] };
  const fileAndSectionPath = inDocPath.split('~');
  let fileHashes: string[] = [];
  let sectionId = undefined;
  if (fileAndSectionPath.length >= 1) {
    fileHashes = fileAndSectionPath[0].split('.');
  }
  if (fileAndSectionPath.length >= 2) {
    sectionId = fileAndSectionPath[1];
  }
  return { fileHashes, sectionId };
}

function setPendingScroll(pending: string, completed?: string) {
  PENDING_SCROLL = pending;
  COMPLETED_SCROLL = completed;
  if (PENDING_SCROLL === COMPLETED_SCROLL) {
    PENDING_SCROLL = COMPLETED_SCROLL = undefined;
  }
}

export function scrollToClosestAncestorAndSetPending({
  fileHashes,
  sectionId,
}: ScrollInfo) {
  const element = document.getElementById(sectionId || '');
  if (element) {
    element.scrollIntoView();
    // console.log(`scrolled to ${sectionId}`);
    return;
  }
  const fullKey = fileHashes.join(SEPARATOR_inDocPath);
  while (fileHashes.length) {
    const key = fileHashes.join(SEPARATOR_inDocPath);
    const ref = REF_MAP.get(key);
    if (ref) {
      // console.log(`Scroll: ${key}`);
      ref.scrollIntoView({ behavior: 'auto' });
      if (key !== fullKey) setPendingScroll(fullKey, key);
      return;
    }
    /* else {
      console.log(REF_MAP);
      console.log(`Not found!!`);
      console.log(key);
    }*/
    fileHashes.pop();
  }
  setPendingScroll(fullKey, undefined);
}
