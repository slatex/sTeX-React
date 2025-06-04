import type { NextPage } from 'next';
import MainLayout from '../layouts/MainLayout';
import { FTMLDocument } from '@kwarc/ftml-react';

const HelpPage: NextPage = () => {
  return (
    <MainLayout title="Help | ALeA">
      <FTMLDocument
        document={{
          type: 'FromBackend',
          uri: 'https://mathhub.info?a=voll-ki/ALeA&p=doc&d=help&l=en',
          toc: 'GET',
        }}
      />
    </MainLayout>
  );
};

export default HelpPage;
