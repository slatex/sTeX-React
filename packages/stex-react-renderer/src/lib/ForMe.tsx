import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Box, Button, IconButton, LinearProgress, Tooltip, Typography } from '@mui/material';
import { getDefiniedaInSection, getLearningObjects } from '@stex-react/api';
import { FTMLFragment } from '@stex-react/ftml-utils';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getLocaleObject } from './lang/utils';
import { ListStepper } from './QuizDisplay';

export function ForMe({
  sectionUri,
  showButtonFirst = true,
  showHideButton = false,
  cachedProblemUris,
  setCachedProblemUris,
}: {
  sectionUri: string;
  showButtonFirst?: boolean;
  showHideButton?: boolean;
  cachedProblemUris: string[] | null;
  setCachedProblemUris: (uris: string[]) => void;
}) {
  const t = getLocaleObject(useRouter()).quiz;
  const [problemUris, setProblemUris] = useState<string[]>(cachedProblemUris || []);
  const [isLoadingProblemUris, setIsLoadingProblemUris] = useState<boolean>(!cachedProblemUris);
  const [problemIdx, setProblemIdx] = useState(0);
  const [show, setShow] = useState(true);
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    if (cachedProblemUris) return;
    setIsLoadingProblemUris(true);
    const fetchProblemUris = async () => {
      try {
        const data = await getDefiniedaInSection(sectionUri);
        const URIs = data?.flatMap((item) => item.conceptUri) || [];

        const fetchedResponse = await getLearningObjects(
          URIs,
          100,
          ['problem'],
          undefined,
          { remember: 0.2, understand: 0.2 },
          { remember: 0.85, understand: 0.85 }
        );

        const extractedProblemIds =
          fetchedResponse?.['learning-objects']?.map((lo: any) => lo['learning-object']) || [];

        setProblemUris(extractedProblemIds);
        setCachedProblemUris(extractedProblemIds);
      } catch (error) {
        console.error('Error fetching problem URIs:', error);
      } finally {
        setIsLoadingProblemUris(false);
      }
    };

    fetchProblemUris();
  }, [sectionUri, cachedProblemUris, setCachedProblemUris]);

  const handleViewSource = (uri: string) => {
    window.open(uri, '_blank');
  };

  if (isLoadingProblemUris) return <LinearProgress />;
  if (!problemUris.length) {
    return (
      <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
        No personalized practice problems for this section
      </Typography>
    );
  }

  if (!show) return null;

  const problemUri = problemUris[problemIdx];

  if (!problemUri) return <>error: [{problemUri}] </>;

  return (
    <Box
      px={1}
      maxWidth="800px"
      m="auto"
      bgcolor="white"
      border="1px solid #CCC"
      borderRadius="5px"
    >
      <Typography fontWeight="bold" textAlign="left">
        {`${t.problem} ${problemIdx + 1} ${t.of} ${problemUris.length} `}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <ListStepper
          idx={problemIdx}
          listSize={problemUris.length}
          onChange={(idx) => {
            setProblemIdx(idx);
            setShowSolution(false);
          }}
        />
        <IconButton onClick={() => handleViewSource(problemUri)} sx={{ float: 'right' }}>
          <Tooltip title="view source">
            <OpenInNewIcon />
          </Tooltip>
        </IconButton>
      </Box>
      <Box mb="10px">
        <FTMLFragment key={problemUri} fragment={{ uri: problemUri }} />
      </Box>
      <Box
        mb={2}
        sx={{ display: 'flex', gap: '10px', flexDirection: 'column', alignItems: 'flex-start' }}
      >
        {showSolution && <Box mb="10px"></Box>}
        {showHideButton && (
          <Button onClick={() => setShow(false)} variant="contained">
            {t.hideForMe || t.hideProblems}
          </Button>
        )}
      </Box>
    </Box>
  );
}
