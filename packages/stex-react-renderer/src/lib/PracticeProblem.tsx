import React, { useState } from 'react';
import { Button, Box, Tabs, Tab } from '@mui/material';
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
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

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
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            sx={{ mb: 2 }}
          >
            <Tab label="ALL PROBLEMS" />
            <Tab label="FOR ME" />
          </Tabs>
          
          {tabValue === 0 && (
            <Box mb={2}>
              <PerSectionQuiz 
                sectionUri={sectionUri} 
                showHideButton={false} 
                showButtonFirst={false} 
              />
            </Box>
          )}
          
          {tabValue === 1 && (
            <Box mb={2}>
              <ForMe 
                sectionUri={sectionUri} 
                showHideButton={false} 
                showButtonFirst={false} 
              />
            </Box>
          )}

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