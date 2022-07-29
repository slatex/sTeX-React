import { StexReactRenderer } from '@stex-react/stex-react-renderer';
import { DEFAULT_BASE_URL } from '@stex-react/utils';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';

const BrowserPage: NextPage = () => {
  const [contentUrl, setContentUrl] = useState('');
  const router = useRouter();
  const id = router.query.id as string;

  useEffect(() => {
    if (!router.isReady) return;
    const decoded = decodeURI(id);
    const url = decoded.startsWith(':sTeX')
      ? DEFAULT_BASE_URL + '/' + decoded
      : decoded;
    setContentUrl(url);
  }, [id, router.isReady]);

  return (
    <MainLayout title="sTeX Browser" showBrowserAutocomplete={true}>
      <StexReactRenderer contentUrl={contentUrl} topOffset={64} />
    </MainLayout>
  );
};

export default BrowserPage;
