import { Comment } from '@stex-react/api';
import { FileLocation, fileLocToString } from '@stex-react/utils';

export function organizeHierarchically(flatComments: Comment[]) {
  // console.log('organizeHierarchically triggered');
  const commentMap = new Map<number, Comment>();
  for (const comment of flatComments) {
    commentMap.set(
      comment.commentId,
      // Make sure we don't muck up flat comments.
      structuredClone(comment)
    );
  }
  const directChildMap = new Map<number, number[]>();
  directChildMap.set(0, []);
  commentMap.forEach((comment, commentId) => {
    const parentId = comment.parentCommentId || 0;
    if (!directChildMap.has(parentId)) {
      directChildMap.set(parentId, []);
    }
    directChildMap.get(parentId)?.push(commentId);
  });

  const topLevel = [] as Comment[];
  commentMap.forEach((comment) => {
    if (directChildMap.get(0)?.indexOf(comment.commentId) !== -1)
      topLevel.push(comment);
  });
  topLevel.sort(
    (c1: Comment, c2: Comment) =>
      (c2.postedTimestampSec || 0) - (c1.postedTimestampSec || 0)
  );
  topLevel.forEach((comment) =>
    generateCommentHierarchy(comment, directChildMap, commentMap)
  );
  return topLevel;
}

function generateCommentHierarchy(
  flatComment: Comment,
  childMap: Map<number, number[]>,
  commentMap: Map<number, Comment>
) {
  const commentId = flatComment.commentId;
  const childIds = childMap.get(commentId) || [];
  for (const childCommentId of childIds) {
    const childComment = commentMap.get(childCommentId);
    if (!childComment) {
      console.log('Should not happen!');
      continue;
    }
    if (!flatComment.childComments) flatComment.childComments = [];
    flatComment.childComments.push(childComment);
    generateCommentHierarchy(childComment, childMap, commentMap);
  }
  // Reverse order at the top level.
  flatComment.childComments?.sort(
    (c1: Comment, c2: Comment) =>
      (c1.postedTimestampSec || 0) - (c2.postedTimestampSec || 0)
  );
}

const DRAFT_KEY_PREFIX = 'DRAFT';

function getDraftKey(f: FileLocation, commentId: number) {
  const parts = [DRAFT_KEY_PREFIX, fileLocToString(f)];
  if (commentId) parts.push(commentId.toString());
  return parts.join(':');
}

export function retrieveDraft(f: FileLocation, commentId: number) {
  const key = getDraftKey(f, commentId);
  return localStorage.getItem(key);
}

export function saveDraft(
  f: FileLocation,
  commentId: number,
  draft: string
) {
  const key = getDraftKey(f, commentId);
  localStorage.setItem(key, draft);
}

export function discardDraft(
  f: FileLocation,
  commentId: number
) {
  const key = getDraftKey(f, commentId);
  localStorage.removeItem(key);
}
