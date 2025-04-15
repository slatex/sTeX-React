import { FTMLDocument } from '@stex-react/ftml-utils';
import type { NextPage } from 'next';
import MainLayout from '../layouts/MainLayout';

const HelpPage: NextPage = () => {
  return (
    <MainLayout title="Help | ALeA">
      <FTMLDocument
        document={{ uri: 'https://mathhub.info?a=voll-ki/ALeA&p=doc&d=help&l=en', toc: 'GET' }}
      />
    </MainLayout>
  );
};

export default HelpPage;
