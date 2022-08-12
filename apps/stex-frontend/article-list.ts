import { FileNode } from '@stex-react/stex-react-renderer';
import ROOT_NODES from './file-structure.preval';

function populateBrowserFiles(
  nodes: FileNode[],
  articleList: { [project: string]: string[] }
) {
  for (const node of nodes) {
    const isFile = node.link.includes('xhtml');
    populateBrowserFiles(node.children, articleList);
    if (isFile) {
      const match = /archive=([^&]+)&filepath=([^"]+xhtml)/g.exec(node.link);
      const projectId = match?.[1];
      const filePath = match?.[2];

      if (!articleList[projectId]) {
        articleList[projectId] = [filePath];
      } else {
        articleList[projectId].push(filePath);
      }
    }
  }
}

function getArticleList() {
  const articleList: { [project: string]: string[] } = {};
  populateBrowserFiles(ROOT_NODES, articleList);
  return articleList;
}

export const ARTICLE_LIST = getArticleList();
