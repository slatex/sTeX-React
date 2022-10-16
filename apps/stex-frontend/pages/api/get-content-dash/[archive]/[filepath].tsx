import { SECTION_IDS } from '../../../../course_info/ai-1-notes';
import { TreeNode } from '../../../../notes-trees.preval';
import {
  AI_ROOT_NODE,
  findNode,
  IWGS_ROOT_NODE,
  LBS_ROOT_NODE,
} from '../../notesHelpers';

function createInfoForNode(node: TreeNode) {
  return {
    archive: node.archive,
    filepath: node.filepath,
    titleAsHtml: node.titleAsHtml,
    children: (node.children || []).map(createInfoForNode),
    secId: SECTION_IDS[`${node.archive}||${node.filepath}`],
  };
}

export default async function handler(req, res) {
  const { archive: archiveEncoded, filepath: filepathEncoded } = req.query;
  const archive = decodeURIComponent(archiveEncoded);
  const filepath = decodeURIComponent(filepathEncoded);
  const nodeId = { archive, filepath };

  for (const tree of [AI_ROOT_NODE, IWGS_ROOT_NODE, LBS_ROOT_NODE]) {
    const node = findNode(nodeId, tree);
    if (node) {
      res.status(200).json(createInfoForNode(node));
      return;
    }
  }
  res.status(204).send();
}
