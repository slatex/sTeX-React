import React, { useState } from 'react';
import { Button, Box } from '@mui/material';
import { PerSectionQuiz } from './PerSectionQuiz';
import { ForMe } from './ForMe';
import { getLocaleObject } from './lang/utils';
import { useRouter } from 'next/router';

interface PracticeProblemProps {
  sectionUri: string;
  showHideButton?: boolean;
}

const PracticeProblem: React.FC<PracticeProblemProps> = ({ sectionUri, showHideButton }) => {
  const [showProblems, setShowProblems] = useState(false);
  const router = useRouter();
  const { quiz: t } = getLocaleObject(router);

  return (
    <Box>
      {!showProblems && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowProblems(true)}
          sx={{ marginBottom: '10px' }}
        >
          {t.practiceProblem}
        </Button>
      )}

      {showProblems && (
        <Box>
          <Box mb={2}>
            <PerSectionQuiz sectionUri={sectionUri} showHideButton={showHideButton} />
          </Box>

          <Box mb={2}>
            <ForMe sectionUri={sectionUri} showHideButton={showHideButton} />
          </Box>

          <Button
            variant="contained"
            color="secondary"
            onClick={() => setShowProblems(false)}
            sx={{ marginTop: '10px' }}
          >
            {t.hidepracticeProblem}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default PracticeProblem;
