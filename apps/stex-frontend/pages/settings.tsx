import { Button } from '@mui/material';
import type { NextPage } from 'next';
import { useReducer } from 'react';
import MainLayout from '../layouts/MainLayout';
import { localStore } from '../utils';

const FORCE_MATHJAX = 'forceMathJax';
const NO_RESPONSIVE = 'no-responsive';
const Home: NextPage = () => {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  return (
    <MainLayout title="VoLL-KI Home">
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
        </main>
      </div>
    </MainLayout>
  );
};

export default Home;
