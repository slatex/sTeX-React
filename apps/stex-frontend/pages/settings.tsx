import { Button } from '@mui/material';
import { localStore } from '@stex-react/utils';
import type { NextPage } from 'next';
import { useReducer } from 'react';
import {
  getUriWeights, setUriWeights
} from '../api/ums';
import MainLayout from '../layouts/MainLayout';

const FORCE_MATHJAX = 'forceMathJax';
const NO_RESPONSIVE = 'no-responsive';
const Home: NextPage = () => {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  return (
    <MainLayout title="Settings | VoLL-KI">
      <div>
        <main>
          <br />
          <Button
            variant="contained"
            size="small"
            sx={{ m: '5px' }}
            onClick={() => {
              if (localStore?.getItem(NO_RESPONSIVE))
                localStore.removeItem(NO_RESPONSIVE);
              else localStore?.setItem(NO_RESPONSIVE, 'yes');
              forceUpdate();
            }}
          >
            {(localStore?.getItem(NO_RESPONSIVE) ? 'Use' : 'Remove') +
              ' Responsive Hack'}
          </Button>
          <Button
            variant="contained"
            size="small"
            sx={{ m: '5px' }}
            onClick={() => {
              if (localStore?.getItem(FORCE_MATHJAX))
                localStore.removeItem(FORCE_MATHJAX);
              else localStore?.setItem(FORCE_MATHJAX, 'yes');
              forceUpdate();
            }}
          >
            {localStore?.getItem(FORCE_MATHJAX)
              ? 'Use native rendering when possible'
              : 'Always use MathJax'}
          </Button>

          <Button
            variant="contained"
            size="small"
            sx={{ m: '5px' }}
            onClick={async () => {
              const resp = await setUriWeights({
                testUri1: 0.5,
                testUri2: 0.7,
              });
              console.log(resp);
            }}
          >
            Set URI
          </Button>

          <Button
            variant="contained"
            size="small"
            sx={{ m: '5px' }}
            onClick={async () => {
              const resp = await getUriWeights(['testUri1', 'testUri2']);
              console.log(resp);
            }}
          >
            Get URI
          </Button>
        </main>
      </div>
    </MainLayout>
  );
};

export default Home;
