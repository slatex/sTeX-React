import { StexReactRenderer } from '@stex-react/stex-react-renderer';
import type { NextPage } from 'next';
import MainLayout from '../layouts/MainLayout';

const HelpPage: NextPage = () => {
  return (
    <MainLayout title="Help | ALeA">
      <StexReactRenderer
        contentUrl={
          ':sTeX/document?archive=voll-ki/ALeA&filepath=doc/help.en.xhtml'
        }
        topOffset={64}
      />
    </MainLayout>
  );
};

export default HelpPage;
