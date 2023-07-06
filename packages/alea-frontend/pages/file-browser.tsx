import { FileBrowser, FileNode, ServerLinksContext } from '@stex-react/stex-react-renderer';
import { PathToArticle } from '@stex-react/utils';
import type { NextPage } from 'next';
import { useContext, useEffect, useState } from 'react';
import { getRootNodes } from '../file-structure';
import MainLayout from '../layouts/MainLayout';

const Browser: NextPage = () => {
  const [rootNodes, setRootNodes] = useState<FileNode[]>([]);
  const { mmtUrl } = useContext(ServerLinksContext);
  
  useEffect(() => {
    getRootNodes(mmtUrl).then((n) => {
      setRootNodes(n);
    });
  }, [mmtUrl]);

  return (
    <MainLayout title="sTeX File Browser | VoLL-KI">
      <FileBrowser
        defaultRootNodes={rootNodes}
        topOffset={64}
        standaloneLink={PathToArticle}
      />
    </MainLayout>
  );
};

export default Browser;
