export interface FileNode {
  label: string;
  link: string;
  children: FileNode[];
  autoOpen?: boolean;
}
