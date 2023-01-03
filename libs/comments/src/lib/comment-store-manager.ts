import { CommentStore } from './comment-store';
import { Comment } from '@stex-react/api';
import { FileLocation } from '@stex-react/utils';

const commentStoreMap = new Map<string, CommentStore>();

function getStore(f: FileLocation) {
  const key = `${f.archive}||${f.filepath}`;
  return commentStoreMap.get(key);
}

function addStore(f: FileLocation, store: CommentStore) {
  const key = `${f.archive}||${f.filepath}`;
  return commentStoreMap.set(key, store);
}

function getExistingOrNewStore(f: FileLocation) {
  const store = getStore(f);
  if (store) return store;
  const newStore = new CommentStore(f);
  addStore(f, newStore);
  return newStore;
}

export async function getPublicCommentTrees(
 file: FileLocation,
  forceRefresh: boolean
): Promise<Comment[]> {
  const store = getExistingOrNewStore(file);
  return await store.getPublicCommentTrees(forceRefresh);
}

export async function getPrivateNotes(
  file: FileLocation,
  forceRefresh: boolean
): Promise<Comment[]> {
  const store = getExistingOrNewStore(file);
  return await store.getPrivateNotes(forceRefresh);
}
