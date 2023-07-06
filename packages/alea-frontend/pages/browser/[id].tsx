import { StexReactRenderer } from '@stex-react/stex-react-renderer';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';


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
