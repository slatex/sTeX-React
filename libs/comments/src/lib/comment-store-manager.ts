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

export async function getHierarchialComments(
  archive: string,
  filepath: string,
  forceRefresh: boolean
): Promise<Comment[]> {
  let store = getStore(archive, filepath);
  if (!store) {
    // console.log('new store');
    store = new CommentStore(archive, filepath);
    addStore(archive, filepath, store);
  }
  return await store.getHierarchialComments(forceRefresh);
}
