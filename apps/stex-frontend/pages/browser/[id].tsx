import { TOCFileNode, StexReactRenderer } from '@stex-react/stex-react-renderer';
import {
  convertHtmlStringToPlain,
  fileLocToString,
  getSectionInfo,
  simpleHash,
} from '@stex-react/utils';
import axios from 'axios';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { DocumentDashInfo } from '../../shared/types';


const BrowserPage: NextPage = () => {
  const router = useRouter();
  const id = router.query.id as string;
  const [contentUrl, setContentUrl] = useState(undefined as string);

  useEffect(() => {
    if (!router.isReady) return;
    const url = decodeURI(id);
    setContentUrl(url);
  }, [id, router.isReady]);
  if (!contentUrl?.length) return;

  return (
    <MainLayout title="sTeX Browser">
      <StexReactRenderer contentUrl={contentUrl} topOffset={64} />
    </MainLayout>
  );
};

export default BrowserPage;
