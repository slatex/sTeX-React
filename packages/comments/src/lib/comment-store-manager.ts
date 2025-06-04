import { CommentStore } from './comment-store';
import { Comment, getComments, RequestAggregator, URI } from '@stex-react/api';
import { from, lastValueFrom, map } from 'rxjs';

const COMMENT_STORE_MAP = new Map<string, CommentStore>();
const COMMENTS_FETCHER = new RequestAggregator<string, Comment[]>(
  undefined,
  (u1: string, u2: string) => u1 === u2,
  (uri: string) => uri,
  (uri: string) => uri,
  (uris: string[]) => from(getComments(uris)),
  (comments: Comment[], requests: string[]) => {
    for (const req of requests) {
      const fileComments = (comments || []).filter(
        (comment) => comment.uri === req
      );
      getExistingOrNewStore(req).setComments(fileComments);
    }
  }
);

function getStore(uri: URI) {
  return COMMENT_STORE_MAP.get(uri);
}

function addStore(uri: URI, store: CommentStore) {
  return COMMENT_STORE_MAP.set(uri, store);
}

function getExistingOrNewStore(uri: URI) {
  const store = getStore(uri);
  if (store) return store;
  const newStore = new CommentStore(uri);
  addStore(uri, newStore);
  return newStore;
}

export async function refreshAllComments() {
  const uris: URI[] = [];
  COMMENT_STORE_MAP.forEach((_value, key) => uris.push(key));
  await lastValueFrom(COMMENTS_FETCHER.informWhenReady(uris));
}

export async function getPublicCommentTrees(uri: URI): Promise<Comment[]> {
  // Too many comments sections. Clear everything and let the cache get rebuilt.
  if (COMMENT_STORE_MAP.size > 500) COMMENT_STORE_MAP.clear();

  const inStore = getStore(uri)?.getPublicCommentTrees();
  if (inStore) return inStore;
  return await lastValueFrom(
    COMMENTS_FETCHER.informWhenReady([uri]).pipe(
      map((_) => getStore(uri)?.getPublicCommentTrees() || [])
    )
  );
}

export async function getPrivateNotes(uri: URI): Promise<Comment[]> {
  const inStore = getStore(uri)?.getPrivateNotes();
  if (inStore) return inStore;
  return await lastValueFrom(
    COMMENTS_FETCHER.informWhenReady([uri]).pipe(
      map((_) => getStore(uri)?.getPrivateNotes() || [])
    )
  );
}
