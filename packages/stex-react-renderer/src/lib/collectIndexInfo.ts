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
  isCovered?: boolean;
}

export interface TOCFileNode extends TOCNode {
  hash: string;
  archive: string;
  filepath: string;
}

export const SEPARATOR_inDocPath = '.';

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
