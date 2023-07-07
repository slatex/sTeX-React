import axios from 'axios';

export interface SectionsAPIData {
  archive?: string;
  filepath?: string;

  title?: string;
  id?: string;

  ids?: string[];
  children: SectionsAPIData[];
}

export async function getDocumentSections(
  mmtUrl: string,
  archive: string,
  filepath: string
) {
  const resp = await axios.get(
    `${mmtUrl}/:sTeX/sections?archive=${archive}&filepath=${filepath}`
  );
  return resp.data as SectionsAPIData;
}

export interface FileNode {
  label: string;

  // TODO: remove the link field after mmt removes it.
  link?: string;
  archive?: string;
  filepath?: string;

  children?: FileNode[];

  // This field is populated by frontend.
  autoOpen?: boolean;
}

// TODO: remove this function after mmt populates archive and filepath.
function populateArchiveAndFilepath(nodes?: FileNode[]) {
  if (!nodes) return;
  for (const node of nodes) {
    if (node.link?.includes('xhtml')) {
      const match = /archive=([^&]+)&filepath=([^"]+xhtml)/g.exec(node.link);
      node.archive = match?.[1];
      node.filepath = match?.[2];
    }
    if (node.children) populateArchiveAndFilepath(node.children);
  }
}

let IN_CACHE_DOCUMENT_TREE: FileNode[] | undefined = undefined;
export async function getDocumentTree(mmtUrl: string) {
  if (!IN_CACHE_DOCUMENT_TREE) {
    const resp = await axios.get(`${mmtUrl}/:sTeX/browser?menu`);
    IN_CACHE_DOCUMENT_TREE = resp.data as FileNode[];
    populateArchiveAndFilepath(IN_CACHE_DOCUMENT_TREE);
  }
  return IN_CACHE_DOCUMENT_TREE;
}
