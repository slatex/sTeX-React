import { Box } from '@mui/material';
import React from 'react';
import { useRouter } from 'next/router';
import MainLayout from '../layouts/MainLayout';
import { StexReactRenderer } from '@stex-react/stex-react-renderer';

const HomeworkDocPage: React.FC = () => {
  const router = useRouter();
  const { archive, filepath, courseId } = router.query as {
    archive: string;
    filepath: string;
    courseId: string;
  };

  if (!archive || !filepath || !courseId) {
    return <div>No data found</div>;
  }

  const contentUrl = `:sTeX/document?archive=${archive}&filepath=${filepath}`;

  return (
    <MainLayout title={`Homework | ${courseId}`}>
      <Box px="10px" bgcolor="white" maxWidth="800px" m="0 auto">
        <StexReactRenderer contentUrl={contentUrl} noFrills={true} topOffset={64} />
        <br />
      </Box>
    </MainLayout>
  );
};

export default HomeworkDocPage;
