import { Comment, getComments } from '@stex-react/api';
import { FileLocation } from '@stex-react/utils';
import { organizeHierarchically } from './comment-helpers';

export class CommentStore {
  private storedPublicComments: Comment[] | undefined = undefined;
  private storedPrivateNotes: Comment[] | undefined = undefined;
  constructor(private fileLoc: FileLocation) {}

  private async fetchFromServer() {
    const flatComments = await getComments(this.fileLoc);
    this.storedPublicComments = organizeHierarchically(
      flatComments.filter((c) => !c.isPrivate)
    );
    this.storedPrivateNotes = flatComments.filter((c) => c.isPrivate);
  }

  async getPublicCommentTrees(forceRefresh: boolean): Promise<Comment[]> {
    if (!this.storedPublicComments || forceRefresh) {
      await this.fetchFromServer();
    }
    return this.storedPublicComments || [];
  }

  async getPrivateNotes(forceRefresh: boolean): Promise<Comment[]> {
    if (!this.storedPrivateNotes || forceRefresh) {
      await this.fetchFromServer();
    }
    return this.storedPrivateNotes || [];
  }
}
