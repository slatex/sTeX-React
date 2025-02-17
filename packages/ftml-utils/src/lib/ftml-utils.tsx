import styles from './ftml-utils.module.scss';
import { TestDocument, TestFragmentA, TestFragmentB } from './ftml-react/test';
import { setDebugLog, setServerUrl, FTMLSetup } from './ftml-react/lib';

export { TestDocument, TestFragmentA, TestFragmentB, setDebugLog, setServerUrl, FTMLSetup };

export function FtmlUtils() {
  return (
    <div className={styles['container']}>
      <h1>Welcome to FtmlUtils!</h1>
    </div>
  );
}

export default FtmlUtils;
