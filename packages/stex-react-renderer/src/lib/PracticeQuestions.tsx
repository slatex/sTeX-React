import { Box } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import { Problem, ProblemResponse, getProblemShtml } from '@stex-react/api';
import { getProblem, hackAwayProblemId } from '@stex-react/quiz-utils';
import { useRouter } from 'next/router';
import { useContext, useEffect, useReducer, useState } from 'react';
import { defaultProblemResponse } from './InlineProblemDisplay';
import { ProblemDisplay } from './ProblemDisplay';
import { ListStepper } from './QuizDisplay';
import { getLocaleObject } from './lang/utils';
import { ServerLinksContext, mmtHTMLToReact } from './stex-react-renderer';

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

  useEffect(() => {
    const problems$ = problemIds.map((p) => getProblemShtml(mmtUrl, p));
    setIsLoadingProblems(true);
    Promise.all(problems$).then((problemStrs) => {
      const problems = problemStrs.map((p) =>
        getProblem(hackAwayProblemId(p), '')
      );
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
      <ListStepper
        idx={problemIdx}
        listSize={problems.length}
        onChange={(idx) => setProblemIdx(idx)}
      />
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
    </Box>
  );
}
