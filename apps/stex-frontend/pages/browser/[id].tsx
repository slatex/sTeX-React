import { StexReactRenderer } from '@stex-react/stex-react-renderer';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { BASE_URL } from '../../constants';
import MainLayout from '../../layouts/MainLayout';

const BrowserPage: NextPage = () => {
  const [contentUrl, setContentUrl] = useState('');
  const router = useRouter();
  const id = router.query.id as string;

  useEffect(() => {
    if (!router.isReady) return;
    const decoded = decodeURI(id);
    const url = decoded.startsWith(':sTeX')
      ? BASE_URL + '/' + decoded
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
