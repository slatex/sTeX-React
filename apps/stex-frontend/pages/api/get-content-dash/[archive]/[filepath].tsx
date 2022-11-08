import { SECTION_IDS } from '../../../../course_info/ai-1-notes';
import { TreeNode } from '../../../../notes-trees.preval';
import {
  AI_ROOT_NODE,
  findNode,
  IWGS_ROOT_NODE,
  LBS_ROOT_NODE,
  KRMT_ROOT_NODE
} from '../../notesHelpers';
import { DocumentDashInfo } from '../../../../shared/types';

function createInfoForNode(node: TreeNode): DocumentDashInfo {
  return {
    archive: node.archive,
    filepath: node.filepath,
    titleAsHtml: node.titleAsHtml,
    children: (node.children || []).map(createInfoForNode),
    secId: SECTION_IDS[`${node.archive}||${node.filepath}`],
  };
}

const CACHED_RESPONSES = new Map<string, DocumentDashInfo>();

export default async function handler(req, res) {
  const { archive: archiveEncoded, filepath: filepathEncoded } = req.query;
  const archive = decodeURIComponent(archiveEncoded);
  const filepath = decodeURIComponent(filepathEncoded);
  const nodeId = { archive, filepath };
  const cacheKey = `${archive}||${filepath}`;
  const cached = CACHED_RESPONSES.get(cacheKey);
  if (cached) {
    res.status(200).json(cached);
    return;
  }
  for (const tree of [AI_ROOT_NODE, IWGS_ROOT_NODE, LBS_ROOT_NODE, KRMT_ROOT_NODE]) {
    const node = findNode(nodeId, tree);
    if (node) {
      const dashInfo = createInfoForNode(node);
      CACHED_RESPONSES.set(cacheKey, dashInfo);
      res.status(200).json(dashInfo);
      return;
    }
  }
  res.status(204).send();
}
