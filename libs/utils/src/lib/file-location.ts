export interface FileLocation {
  archive: string;
  filepath: string;
}

export function fileLocToString(f: FileLocation) {
  return `${f.archive}||${f.filepath}`;
}

export function stringToFileLoc(s: string): FileLocation {
  const parts = s.split('||');
  if (parts.length != 2) return { archive: '', filepath: '' };
  return { archive: parts[0], filepath: parts[1] };
}

export function FileLocationEquals(f1: FileLocation, f2: FileLocation) {
  if (!f1 || !f2) return !f1 && !f2;
  return f1.archive === f2.archive && f1.filepath === f2.filepath;
}
