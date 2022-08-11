import type { NextPage } from 'next';
import { FileBrowser } from '../components/FileBrowser';
import MainLayout from '../layouts/MainLayout';

const Browser: NextPage = () => {
  return (
    <MainLayout title="VoLL-KI Home">
      <FileBrowser />
    </MainLayout>
  );
};

export default Browser;
