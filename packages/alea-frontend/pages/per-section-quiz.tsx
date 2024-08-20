import React from 'react';
import { useRouter } from 'next/router';
import { Typography, Button, Box, Tooltip } from '@mui/material';
import { PerSectionQuiz } from 'packages/stex-react-renderer/src/lib/PerSectionQuiz';
import MainLayout from '../layouts/MainLayout';
import { PRIMARY_COL } from '@stex-react/utils';
import { getLocaleObject } from 'packages/stex-react-renderer/src/lib/lang/utils';
// import { getLocaleObject } from '../lang/utils';

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
    <MainLayout title="All Comments | VoLL-KI">
      <Box display="flex" mt="10px" justifyContent="center" alignItems="center">
        <Tooltip title="Go to Course Problem Page">
          <Button
            variant="outlined"
            sx={{
              fontSize: '0.875rem',
              borderColor: PRIMARY_COL,
              color: PRIMARY_COL,
              marginRight: '2rem',
              marginLeft: '1rem',
              height: 'auto',
              padding: '14px 12px',
              '&:hover': {
                backgroundColor: PRIMARY_COL,
                color: 'white',
              },
            }}
            onClick={handleButtonClick}
          >
            {t.courseProblemPage}&nbsp;
          </Button>
        </Tooltip>
        {/* <Box display="flex" flexDirection="column" alignItems="center">
          <Typography variant="h6" color="textSecondary" fontWeight="bold">
            Problems for
          </Typography>
          <Typography variant="h6" color={PRIMARY_COL} fontWeight="bold">
            {title || 'Unknown Title'}
          </Typography>
        </Box> */}
        <b
          style={{
            color: 'gray',
            fontSize: '1.5rem',
            fontWeight: 'bold',
          }}
        >
          {t.problemsFor}&nbsp;
          <span
            style={{
              color: PRIMARY_COL,
              fontSize: '1.5rem',
              fontWeight: 'bold',
            }}
          >
            {` ${title || 'Unknown Title'}`}
          </span>
        </b>
      </Box>

      <Box px="10px" bgcolor="white" margin="10px">
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
