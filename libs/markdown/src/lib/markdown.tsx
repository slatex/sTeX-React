import styles from './markdown.module.scss';

/* eslint-disable-next-line */
export interface MarkdownProps {}

export function Markdown(props: MarkdownProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to Markdown!</h1>
    </div>
  );
}

export default Markdown;
