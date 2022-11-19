import { Comment, getComments } from '@stex-react/api';
import { organizeHierarchically } from './comment-helpers';

export class CommentStore {
  private storedComments: Comment[]|undefined = undefined;
  constructor(private archive: string, private filepath: string) {}

  async getHierarchialComments(forceRefresh: boolean): Promise<Comment[]> {
    if (!this.storedComments || forceRefresh) {
      const flatComments = await getComments(this.archive, this.filepath);
      this.storedComments = organizeHierarchically(flatComments);
    }
    return this.storedComments;
  }
}
