import { Comment, URI } from '@stex-react/api';
import { organizeHierarchically } from './comment-helpers';

export class CommentStore {
  private storedPublicComments: Comment[] | undefined = undefined;
  private storedPrivateNotes: Comment[] | undefined = undefined;
  constructor(private uri: URI) {}

  public setComments(flatComments: Comment[]) {
    this.storedPublicComments = organizeHierarchically(
      flatComments.filter((c) => !c.isPrivate)
    );
    this.storedPrivateNotes = flatComments.filter((c) => c.isPrivate);
  }

  getPublicCommentTrees(): Comment[] | undefined {
    return this.storedPublicComments;
  }

  getPrivateNotes(): Comment[] | undefined {
    return this.storedPrivateNotes;
  }
}
