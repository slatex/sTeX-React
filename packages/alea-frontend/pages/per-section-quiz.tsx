import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, IconButton, Tooltip } from '@mui/material';
import { getLocaleObject, mmtHTMLToReact, PerSectionQuiz } from '@stex-react/stex-react-renderer';
import { PRIMARY_COL } from '@stex-react/utils';
import { useRouter } from 'next/router';
import React from 'react';
import MainLayout from '../layouts/MainLayout';

const PerSectionQuizPage: React.FC = () => {
  const router = useRouter();
  const { practiceProblems: t } = getLocaleObject(router);

  const { archive, filepath, title, courseId } = router.query as {
    archive: string;
    filepath: string;
    title: string;
    courseId: string;
  };

  const handleButtonClick = () => {
    router.push(`/practice-problems/${courseId}`);
  };

  if (!archive || !filepath) {
    return <div>No data found</div>;
  }

  return (
    <MainLayout title="PerSection Problems | ALeA">
      <Box px="10px" bgcolor="white" maxWidth="800px" m="0 auto">
        <Box display="flex" mt="10px" gap="10px" alignItems="center" my={2}>
          <Tooltip title={t.backToAllCourseProblems}>
            <IconButton onClick={handleButtonClick}>
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>

          <b style={{ color: 'gray', fontSize: '1.5rem', fontWeight: 'bold' }}>
            {t.problemsFor}&nbsp;
            <span
              style={{
                color: PRIMARY_COL,
                fontSize: '1.5rem',
                fontWeight: 'bold',
              }}
            >
              {title ? mmtHTMLToReact(title) : 'Untitled'} ({courseId.toUpperCase()})
            </span>
          </b>
        </Box>
        <PerSectionQuiz
          key={archive}
          archive={archive}
          filepath={filepath}
          showButtonFirst={false}
        />
        <br />
        <Box textAlign="left" mx="auto" mt="20px">
          <b style={{ color: 'red' }}>{t.warning}&nbsp;</b>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default PerSectionQuizPage;
