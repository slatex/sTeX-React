import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Box, Button, IconButton, Tooltip } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import { Problem, ProblemResponse, getProblemShtml } from '@stex-react/api';
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

function handleViewSource(problemId: string) {
  const [projectId, filePath] = extractProjectIdAndFilepath(problemId);
  const sourceLink = sourceFileUrl(projectId, filePath);
  console.log('sourceLink', sourceLink);
  window.open(sourceLink, '_blank');
}

export function PracticeQuestions({
  problemIds,
  showButtonFirst = true,
}: {
  problemIds: string[];
  showButtonFirst?: boolean;
}) {
  const t = getLocaleObject(useRouter()).quiz;
  const { mmtUrl } = useContext(ServerLinksContext);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoadingProblems, setIsLoadingProblems] = useState<boolean>(true);
  const [responses, setResponses] = useState<ProblemResponse[]>([]);
  const [problemIdx, setProblemIdx] = useState(0);
  const [isFrozen, setIsFrozen] = useState<boolean[]>([]);
  const [, forceRerender] = useReducer((x) => x + 1, 0);
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    const problems$ = problemIds.map((p) => getProblemShtml(mmtUrl, p));
    setIsLoadingProblems(true);
    Promise.all(problems$).then((problemStrs) => {
      const problems = problemStrs.map((p) => getProblem(hackAwayProblemId(p), ''));
      setProblems(problems);
      setResponses(problems.map((p) => defaultProblemResponse(p)));
      setIsFrozen(problems.map(() => false));
      setIsLoadingProblems(false);
    });
  }, [problemIds, mmtUrl]);

  if (!problemIds.length) return !showButtonFirst && <i>No problems found.</i>;
  if (isLoadingProblems) return <LinearProgress />;

  const problem = problems[problemIdx];
  const response = responses[problemIdx];
  const solutions = problems[problemIdx]?.solutions;

  if (!problem || !response) return <>error</>;

  return (
    <Box
      px="10px"
      maxWidth="800px"
      m="auto"
      bgcolor="white"
      border="1px solid #CCC"
      borderRadius="5px"
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <h2>
          {t.problem} {problemIdx + 1} {t.of} {problems.length}&nbsp;
          {problem.header && <>({mmtHTMLToReact(problem.header)})</>}
        </h2>
      </Box>
      <Box display="flex" justifyContent="space-between">
        <ListStepper
          idx={problemIdx}
          listSize={problems.length}
          onChange={(idx) => {
            setProblemIdx(idx);
            setShowSolution(false);
          }}
        />
        <IconButton onClick={() => handleViewSource(problemIds[problemIdx])}>
          <Tooltip title="view source">
            <OpenInNewIcon />
          </Tooltip>
        </IconButton>
      </Box>
      <Box my="10px">
        <ProblemDisplay
          r={response}
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
            {showSolution ? t.hideSolution : t.checkSolution}
          </Button>
        )}
        {showSolution && (
          <Box mb="10px">
            {solutions.map((solution) => (
              <div style={{ color: '#555' }}>{mmtHTMLToReact(solution)}</div>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
