import styles from './report-a-problem.module.scss';

/* eslint-disable-next-line */
export interface ReportAProblemProps {}

export function ReportAProblem(props: ReportAProblemProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to ReportAProblem!</h1>
    </div>
  );
}

export default ReportAProblem;
