import { TreeNode } from '../../../../ai-notes.preval';
import { AI_ROOT_NODE, findNode } from '../../notesHelpers';

function createInfoForNode(node: TreeNode) {
  return {
    archive: node.archive,
    filepath: node.filepath,
    titleAsHtml: node.titleAsHtml,
    children: (node.children || []).map(createInfoForNode),
  };
}

export default async function handler(req, res) {
  const { archive: archiveEncoded, filepath: filepathEncoded } = req.query;
  const archive = decodeURIComponent(archiveEncoded);
  const filepath = decodeURIComponent(filepathEncoded);
  const nodeId = { archive, filepath };

  const node = findNode(nodeId, AI_ROOT_NODE);
  if (!node) res.status(204).send();
  else res.status(200).json(createInfoForNode(node));
}
