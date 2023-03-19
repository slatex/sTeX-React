import { CommentStore } from './comment-store';
import { Comment, getComments, RequestAggregator } from '@stex-react/api';
import {
  FileLocation,
  FileLocationEquals,
  fileLocToString,
  stringToFileLoc,
} from '@stex-react/utils';
import { from, lastValueFrom, map } from 'rxjs';

const COMMENT_STORE_MAP = new Map<string, CommentStore>();
const COMMENTS_FETCHER = new RequestAggregator<FileLocation, Comment[]>(
  undefined,
  FileLocationEquals,
  fileLocToString,
  stringToFileLoc,
  (files: FileLocation[]) => from(getComments(files)),
  (comments: Comment[], requests: FileLocation[]) => {
    for (const req of requests) {
      const fileComments = (comments || []).filter(
        (comment) =>
          comment.archive === req.archive && comment.filepath === req.filepath
      );
      getExistingOrNewStore(req).setComments(fileComments);
    }
  }
);

function getStore(f: FileLocation) {
  return COMMENT_STORE_MAP.get(fileLocToString(f));
}

function addStore(f: FileLocation, store: CommentStore) {
  return COMMENT_STORE_MAP.set(fileLocToString(f), store);
}

function getExistingOrNewStore(f: FileLocation) {
  const store = getStore(f);
  if (store) return store;
  const newStore = new CommentStore(f);
  addStore(f, newStore);
  return newStore;
}

export async function refreshAllComments() {
  const files: FileLocation[] = [];
  COMMENT_STORE_MAP.forEach((_value, key) => files.push(stringToFileLoc(key)));
  await lastValueFrom(COMMENTS_FETCHER.informWhenReady(files));
}

export async function getPublicCommentTrees(
  file: FileLocation
): Promise<Comment[]> {
  // Too many comments sections. Clear everything and let the cache get rebuilt.
  if (COMMENT_STORE_MAP.size > 500) COMMENT_STORE_MAP.clear();

  const inStore = getStore(file)?.getPublicCommentTrees();
  if (inStore) return inStore;
  return await lastValueFrom(
    COMMENTS_FETCHER.informWhenReady([file]).pipe(
      map((_) => getStore(file)?.getPublicCommentTrees() || [])
    )
  );
}

export async function getPrivateNotes(file: FileLocation): Promise<Comment[]> {
  const inStore = getStore(file)?.getPrivateNotes();
  if (inStore) return inStore;
  return await lastValueFrom(
    COMMENTS_FETCHER.informWhenReady([file]).pipe(
      map((_) => getStore(file)?.getPrivateNotes() || [])
    )
  );
}
