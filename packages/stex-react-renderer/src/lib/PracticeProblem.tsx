import React, { useState } from 'react';
import { Button, Box } from '@mui/material';
import { PerSectionQuiz } from './PerSectionQuiz';
import { ForMe } from './ForMe';
import { getLocaleObject } from './lang/utils';
import { useRouter } from 'next/router';

interface PracticeProblemProps {
  archive: any;
  filepath: string;
  showHideButton: boolean;
}

const PracticeProblem: React.FC<PracticeProblemProps> = ({ archive, filepath, showHideButton }) => {
  const [showProblems, setShowProblems] = useState(false);
  const t = getLocaleObject(useRouter()).quiz;

  return (
    <Box>
      {!showProblems && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowProblems(true)}
          style={{ marginBottom: '10px' }}
        >
         {t.practiceProblem}
        </Button>
      )}

      {showProblems && (
        <Box>
          <Box mb={2}>
            <PerSectionQuiz archive={archive} filepath={filepath} showHideButton={showHideButton} />
          </Box>

          <Box mb={2}>
            <ForMe archive={archive} filepath={filepath} showHideButton={showHideButton} />
          </Box>

          <Button
            variant="contained"
            color="secondary"
            onClick={() => setShowProblems(false)}
            style={{ marginTop: '10px' }}
          >
            {t.hidepracticeProblem}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default PracticeProblem;
