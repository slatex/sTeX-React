import styles from './comments.module.scss';

/* eslint-disable-next-line */
export interface CommentsProps {}

export function Comments(props: CommentsProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to Comments!</h1>
    </div>
  );
}

export default Comments;
