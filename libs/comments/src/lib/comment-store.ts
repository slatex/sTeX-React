import { Comment } from '@stex-react/api';
import { FileLocation } from '@stex-react/utils';
import { organizeHierarchically } from './comment-helpers';

export class CommentStore {
  private storedPublicComments: Comment[] | undefined = undefined;
  private storedPrivateNotes: Comment[] | undefined = undefined;
  constructor(private fileLoc: FileLocation) {}

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
