export interface FileLocation {
  archive: string;
  filepath: string;
}

export function fileLocToString(nodeId: FileLocation) {
  return `${nodeId.archive}||${nodeId.filepath}`;
}

export function stringToFileLoc(s: string): FileLocation | undefined {
  const parts = s.split('||');
  if (parts.length != 2) return;
  return { archive: parts[0], filepath: parts[1] };
}
