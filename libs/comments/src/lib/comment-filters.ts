import { Comment, isHiddenNotSpam, isSpam } from '@stex-react/api';

export class CommentFilters {
  showHidden = false;
  showSpam = false;

  constructor(private onResetNeeded: () => void) {}

  onShowHidden() {
    this.showHidden = !this.showHidden;
    if (!this.showHidden) {
      this.showSpam = false;
    }
    this.onResetNeeded();
  }

  onShowSpam() {
    this.showSpam = !this.showSpam;
    if (this.showSpam) {
      this.showHidden = true;
    }
    this.onResetNeeded();
  }

  filterHidden(comment: Comment) {
    comment.childComments = comment.childComments?.filter((c) =>
      this.isCommentVisible(c)
    );
    comment.childComments?.forEach((c) => this.filterHidden(c));
  }

  private isCommentVisible(comment: Comment) {
    if (!comment) return false;
    if (!this.showSpam && isSpam(comment.hiddenStatus)) {
      return false;
    }
    if (
      !(this.showHidden || this.showSpam) &&
      isHiddenNotSpam(comment.hiddenStatus)
    ) {
      return false;
    }
    return true;
  }
}
