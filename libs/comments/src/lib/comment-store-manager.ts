import { CommentStore } from './comment-store';
import { Comment } from '@stex-react/api';

const commentStoreMap = new Map<string, CommentStore>();

function getStore(archive: string, filepath: string) {
  const key = `${archive}||${filepath}`;
  return commentStoreMap.get(key);
}

function addStore(archive: string, filepath: string, store: CommentStore) {
  const key = `${archive}||${filepath}`;
  return commentStoreMap.set(key, store);
}

function getExistingOrNewStore(archive: string, filepath: string) {
  const store = getStore(archive, filepath);
  if (store) return store;
  const newStore = new CommentStore(archive, filepath);
  addStore(archive, filepath, newStore);
  return newStore;
}

export async function getPublicCommentTrees(
  archive: string,
  filepath: string,
  forceRefresh: boolean
): Promise<Comment[]> {
  const store = getExistingOrNewStore(archive, filepath);
  return await store.getPublicCommentTrees(forceRefresh);
}

export async function getPrivateNotes(
  archive: string,
  filepath: string,
  forceRefresh: boolean
): Promise<Comment[]> {
  const store = getExistingOrNewStore(archive, filepath);
  return await store.getPrivateNotes(forceRefresh);
}
