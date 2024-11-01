import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Box, Button, IconButton, Tooltip, Typography } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import { Problem, ProblemResponse, getProblemIdsForFile, getProblemShtml } from '@stex-react/api';
import { getProblem, hackAwayProblemId } from '@stex-react/quiz-utils';
import { sourceFileUrl } from '@stex-react/utils';
import { useRouter } from 'next/router';
import { useContext, useEffect, useReducer, useState } from 'react';
import { defaultProblemResponse } from './InlineProblemDisplay';
import { ProblemDisplay } from './ProblemDisplay';
import { ListStepper } from './QuizDisplay';
import { getLocaleObject } from './lang/utils';
import { ServerLinksContext, mmtHTMLToReact } from './stex-react-renderer';
import { extractProjectIdAndFilepath } from './utils';

export function PerSectionQuiz({
  archive,
  filepath,
  showButtonFirst = true,
  showHideButton = false,
}: {
  archive: string;
  filepath: string;
  showButtonFirst?: boolean;
  showHideButton?: boolean;
}) {
  const t = getLocaleObject(useRouter()).quiz;
  const { mmtUrl } = useContext(ServerLinksContext);
  const [problemIds, setProblemIds] = useState<string[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoadingProblemIds, setIsLoadingProblemIds] = useState<boolean>(true);
  const [isLoadingProblems, setIsLoadingProblems] = useState<boolean>(true);
  const [responses, setResponses] = useState<ProblemResponse[]>([]);
  const [problemIdx, setProblemIdx] = useState(0);
  const [isFrozen, setIsFrozen] = useState<boolean[]>([]);
  const [, forceRerender] = useReducer((x) => x + 1, 0);
  const [startQuiz, setStartQuiz] = useState(!showButtonFirst);
  const [show, setShow] = useState(true);
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    if (!archive || !filepath) return;
    setIsLoadingProblemIds(true);
    getProblemIdsForFile(mmtUrl, archive, filepath).then((p) => {
      setProblemIds(p);
      setIsLoadingProblemIds(false);
    }, console.error);
  }, [archive, filepath, mmtUrl]);

  useEffect(() => {
    if (!startQuiz) return;
    const problems$ = problemIds.map((p) => getProblemShtml(mmtUrl, p));
    setIsLoadingProblems(true);
    Promise.all(problems$).then((problemStrs) => {
      const problems = problemStrs.map((p) => getProblem(hackAwayProblemId(p), ''));
      setProblems(problems);
      setResponses(problems.map((p) => defaultProblemResponse(p)));
      setIsFrozen(problems.map(() => false));
      setProblemIdx(0);
      setIsLoadingProblems(false);
    });
  }, [startQuiz, problemIds, mmtUrl]);

  function handleViewSource(problemId: string) {
    const [projectId, filePath] = extractProjectIdAndFilepath(problemId);
    const sourceLink = sourceFileUrl(projectId, filePath);
    window.open(sourceLink, '_blank');
  }
  if (isLoadingProblemIds) return null;
  if (!problemIds.length) return !showButtonFirst && <i>No problems found.</i>;
  if (!startQuiz) {
    return (
      <Button onClick={() => setStartQuiz(true)} variant="contained">
        {t.perSectionQuizButton.replace('$1', problemIds.length.toString())}
      </Button>
    );
  }
  if (!show) {
    return (
      <Button onClick={() => setShow(true)} variant="contained">
        {t.perSectionQuizButton.replace('$1', problemIds.length.toString())}
      </Button>
    );
  }
  if (isLoadingProblems) return <LinearProgress />;

  const problem = problems[problemIdx];
  const response = responses[problemIdx];
  const solutions = problems[problemIdx]?.subProblemData?.map((p) => p.solution);

  if (!problem || !response) return <>error</>;

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
        {`${t.problem} ${problemIdx + 1} ${t.of} ${problems.length} `}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <ListStepper
          idx={problemIdx}
          listSize={problems.length}
          onChange={(idx) => {
            setProblemIdx(idx);
            setShowSolution(false);
          }}
        />
        <IconButton
          onClick={() => handleViewSource(problemIds[problemIdx])}
          sx={{ float: 'right' }}
        >
          <Tooltip title="view source">
            <OpenInNewIcon />
          </Tooltip>
        </IconButton>
      </Box>
      {problem.header && (
        <div style={{ color: '#555', marginTop: '10px' }}>{mmtHTMLToReact(problem.header)}</div>
      )}
      <Box mb="10px">
        <ProblemDisplay
          r={response}
          uri={problemIds[problemIdx]}
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
        />
      </Box>
      <Box
        mb={2}
        sx={{ display: 'flex', gap: '10px', flexDirection: 'column', alignItems: 'flex-start' }}
      >
        {solutions?.length > 0 && (
          <Button variant="contained" onClick={() => setShowSolution(!showSolution)}>
            {showSolution ? t.hideSolution : t.showSolution}
          </Button>
        )}
        {showSolution && (
          <Box mb="10px">
            {solutions.map((solution) => (
              <div style={{ color: '#555' }}>{mmtHTMLToReact(solution)}</div>
            ))}
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
