import { FileBrowser } from '@stex-react/stex-react-renderer';
import { DEFAULT_BASE_URL } from '@stex-react/utils';
import type { NextPage } from 'next';
import MainLayout from '../layouts/MainLayout';
import ROOT_NODES from '../file-structure.preval';

const Browser: NextPage = () => {
  return (
    <MainLayout title="VoLL-KI Home">
      <FileBrowser
        defaultRootNodes={ROOT_NODES}
        topOffset={64}
        baseUrl={DEFAULT_BASE_URL}
      />
    </MainLayout>
  );
};

export default Browser;
