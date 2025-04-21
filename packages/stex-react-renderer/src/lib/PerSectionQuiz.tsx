import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Box, Button, IconButton, Tooltip, Typography } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import { getSourceUrl } from '@stex-react/api';
import { FTMLFragment, ProblemResponse } from '@stex-react/ftml-utils';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useReducer, useState } from 'react';
import { ListStepper } from './QuizDisplay';
import { getLocaleObject } from './lang/utils';

export function handleViewSource(problemUri: string) {
  getSourceUrl(problemUri).then((sourceLink) => {
    if (sourceLink) window.open(sourceLink, '_blank');
  });
}
export function PerSectionQuiz({
  sectionUri,
  showButtonFirst = true,
  showHideButton = false,
}: {
  sectionUri: string;
  showButtonFirst?: boolean;
  showHideButton?: boolean;
}) {
  const t = getLocaleObject(useRouter()).quiz;
  const [problemUris, setProblemUris] = useState<string[]>([]);
  const [isLoadingProblemUris, setIsLoadingProblemUris] = useState<boolean>(true);
  const [responses, setResponses] = useState<ProblemResponse[]>([]);
  const [problemIdx, setProblemIdx] = useState(0);
  const [isFrozen, setIsFrozen] = useState<boolean[]>([]);
  const [, forceRerender] = useReducer((x) => x + 1, 0);
  const [startQuiz, setStartQuiz] = useState(!showButtonFirst);
  const [show, setShow] = useState(true);
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    if (!sectionUri) return;
    setIsLoadingProblemUris(true);
    axios
      .get(`/api/get-problems-by-section?sectionUri=${encodeURIComponent(sectionUri)}`)
      .then((resp) => {
        setProblemUris(resp.data);
        setIsLoadingProblemUris(false);
      }, console.error);
  }, [sectionUri]);


  if (isLoadingProblemUris) return null;
  if (!problemUris.length) return !showButtonFirst && <i>No problems found.</i>;
  if (!startQuiz) {
    return (
      <Button onClick={() => setStartQuiz(true)} variant="contained">
        {t.perSectionQuizButton.replace('$1', problemUris.length.toString())}
      </Button>
    );
  }
  if (!show) {
    return (
      <Button onClick={() => setShow(true)} variant="contained">
        {t.perSectionQuizButton.replace('$1', problemUris.length.toString())}
      </Button>
    );
  }
  if (isLoadingProblemUris) return <LinearProgress />;

  const problemUri = problemUris[problemIdx];
  // TODO ALEA4-P3 const response = responses[problemIdx];
  // const solutions = problems[problemIdx]?.subProblemData?.map((p) => p.solution);

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
      {/* TODO ALEA4-P3 problem.header && (
        <div style={{ color: '#555', marginTop: '10px' }}>{mmtHTMLToReact(problem.header)}</div>
      )}*/}
      <Box mb="10px">
        <FTMLFragment key={problemUri} fragment={{ uri: problemUri }} />
        {/*<ProblemDisplay
          r={response}
          uri={problemUris[problemIdx]}
          showPoints={false}
          problem={problem}
          isFrozen={isFrozen[problemIdx]}
          onResponseUpdate={(response) => {
            forceRerender();
            setResponses((prev) => {
              prev[problemIdx] = response;
              return prev;
            });
          }}
          onFreezeResponse={() =>
            setIsFrozen((prev) => {
              prev[problemIdx] = true;
              return [...prev];
            })
          }
        />*/}
      </Box>
      <Box
        mb={2}
        sx={{ display: 'flex', gap: '10px', flexDirection: 'column', alignItems: 'flex-start' }}
      >
        {/* TODO ALEA4-P3 solutions?.length > 0 && (
          <Button variant="contained" onClick={() => setShowSolution(!showSolution)}>
            {showSolution ? t.hideSolution : t.showSolution}
          </Button>
        )}*/}
        {showSolution && (
          <Box mb="10px">
            {/* solutions.map((solution) => (
              <div style={{ color: '#555' }} dangerouslySetInnerHTML={{__html:solution}}></div>
            ))*/}
          </Box>
        )}
        {showHideButton && (
          <Button onClick={() => setShow(false)} variant="contained">
            {t.hideProblems}
          </Button>
        )}
      </Box>
    </Box>
  );
}
