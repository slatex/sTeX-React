import { FileNode } from "@stex-react/stex-react-renderer";
import axios from "axios";

let ROOT_NODES = undefined as FileNode[];
export async function getRootNodes(mmtUrl: string) {
  if (!ROOT_NODES) {
    console.log('Fetching root file nodes...');
    ROOT_NODES = await axios.get(`${mmtUrl}/:sTeX/browser?menu`).then((r) => {
      console.log('Root file nodes fetched');
      return r.data;
    });
  }
  return ROOT_NODES;
}

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

export async function getArticleList(mmtUrl: string) {
  const articleList: { [project: string]: string[] } = {};
  const rootNodes = await getRootNodes(mmtUrl);
  populateBrowserFiles(rootNodes, articleList);
  return articleList;
}
