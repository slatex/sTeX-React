import { FileNode, getDocumentTree } from '@stex-react/api';
import {
  FileBrowser,
  ServerLinksContext,
} from '@stex-react/stex-react-renderer';
import { PathToArticle } from '@stex-react/utils';
import type { NextPage } from 'next';
import { useContext, useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';

const Browser: NextPage = () => {
  const [rootNodes, setRootNodes] = useState<FileNode[]>([]);
  const { mmtUrl } = useContext(ServerLinksContext);

  useEffect(() => {
    getDocumentTree(mmtUrl).then(setRootNodes);
  }, [mmtUrl]);

  return (
    <MainLayout title="sTeX File Browser | ALeA">
      <FileBrowser
        defaultRootNodes={rootNodes}
        topOffset={64}
        standaloneLink={PathToArticle}
      />
    </MainLayout>
  );
};

export default Browser;
