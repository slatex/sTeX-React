// eslint-disable-next-line @typescript-eslint/no-unused-vars

import { Box } from '@mui/material';
import { FTMLSetup } from '../ftml-react/lib';

import { useState } from 'react';
import * as FTML from '../ftml-react/lib';
import { TestDocument, TestFragmentA, TestFragmentB } from '../ftml-react/test';

FTML.setDebugLog();
FTML.setServerUrl('https://mmt.beta.vollki.kwarc.info');

const Click: React.FC = () => {
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
      <p>
        Edit <code>src/App.tsx</code> and save to test HMR
      </p>
    </>
  );
};

export function App() {
  return (
    <div>
      <Box>Empty1</Box>
      return (
      <FTMLSetup>
        <>
          <div></div>
          <h1>Vite & React</h1>
          <div className="card">
            <Click />
          </div>
          <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
          <TestFragmentA />
          <TestFragmentB />
          <TestDocument />
        </>
      </FTMLSetup>
      )
    </div>
  );
}

export default App;
