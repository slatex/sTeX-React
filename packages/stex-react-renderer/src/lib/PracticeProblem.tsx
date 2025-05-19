import { Box, Button, Tab, Tabs } from '@mui/material';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { ForMe } from './ForMe';
import { getLocaleObject } from './lang/utils';
import { PerSectionQuiz } from './PerSectionQuiz';

interface PracticeProblemProps {
  sectionUri: string;
  showHideButton?: boolean;
}

const PracticeProblem: React.FC<PracticeProblemProps> = ({ sectionUri, showHideButton }) => {
  const [showProblems, setShowProblems] = useState(false);
  const router = useRouter();
  const { quiz: t } = getLocaleObject(router);
  const [tabValue, setTabValue] = useState(0);

  // Caching states
  const [perSectionProblemUris, setPerSectionProblemUris] = useState<string[] | null>(null);
  const [formeProblemUris, setFormeProblemUris] = useState<string[] | null>(null);

  const handleTabChange = React.useCallback((event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  }, []);

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
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab label={t.ForMe} />
            <Tab label={t.perSectionQuizButton} />
          </Tabs>

          {tabValue === 0 && (
            <Box mb={2}>
              <ForMe
                sectionUri={sectionUri}
                showHideButton={false}
                showButtonFirst={false}
                cachedProblemUris={formeProblemUris}
                setCachedProblemUris={setFormeProblemUris}
              />
            </Box>
          )}

          {tabValue === 1 && (
            <Box mb={2}>
              <PerSectionQuiz
                sectionUri={sectionUri}
                showHideButton={false}
                showButtonFirst={false}
                cachedProblemUris={perSectionProblemUris}
                setCachedProblemUris={setPerSectionProblemUris}
              />
            </Box>
          )}

          <Button
            variant="contained"
            color="primary"
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
