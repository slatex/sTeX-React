import { Box } from '@mui/material';
import { ContentFromUrl } from '@stex-react/stex-react-renderer';
import { BG_COLOR, getChildrenOfBodyNode } from '@stex-react/utils';
import type { NextPage } from 'next';
import MainLayout from '../layouts/MainLayout';

const HelpPage: NextPage = () => {
  return (
    <MainLayout title="Help | VoLL-KI">
      <Box width="100%" bgcolor={BG_COLOR}>
        <Box maxWidth="650px" margin="auto">
          <ContentFromUrl
            url=":sTeX/document?archive=voll-ki/SSFC&filepath=doc/help.en.xhtml"
            modifyRendered={getChildrenOfBodyNode}
          />
        </Box>
      </Box>
    </MainLayout>
  );
};

export default HelpPage;
