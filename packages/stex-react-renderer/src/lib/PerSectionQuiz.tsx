import { Box, Button } from '@mui/material';
import {
  Problem,
  ProblemResponse,
  getProblemIdsForFile,
  getProblemShtml
} from '@stex-react/api';
import { getProblem, hackAwayProblemId } from '@stex-react/quiz-utils';
import { useRouter } from 'next/router';
import { useContext, useEffect, useReducer, useState } from 'react';
import { defaultProblemResponse } from './InlineProblemDisplay';
import { ProblemDisplay } from './ProblemDisplay';
import { ListStepper } from './QuizDisplay';
import { RenderOptions } from './RendererDisplayOptions';
import { getLocaleObject } from './lang/utils';
import { ServerLinksContext, mmtHTMLToReact } from './stex-react-renderer';

export function PerSectionQuiz({
  archive,
  filepath,
  showButtonFirst = true,
}: {
  archive: string;
  filepath: string;
  showButtonFirst: boolean;
}) {
  const t = getLocaleObject(useRouter()).quiz;
  const { mmtUrl } = useContext(ServerLinksContext);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [responses, setResponses] = useState<ProblemResponse[]>([]);
  const [problemIdx, setProblemIdx] = useState(0);
  const [isFrozen, setIsFrozen] = useState<boolean[]>([]);
  const [, forceRerender] = useReducer((x) => x + 1, 0);
  const [startQuiz, setStartQuiz] = useState(!showButtonFirst);
  const { renderOptions } = useContext(RenderOptions);

  useEffect(() => {
    if (!archive || !filepath || renderOptions.noFrills) return;
    setIsLoading(true);
    getProblemIdsForFile(mmtUrl, archive, filepath).then(async (problemIds) => {
      const problems$ = problemIds.map((p) => getProblemShtml(mmtUrl, p));
      const problemStrs = await Promise.all(problems$);
      const problems = problemStrs.map((p) =>
        getProblem(hackAwayProblemId(p), '')
      );
      setProblems(problems);
      setResponses(problems.map((p) => defaultProblemResponse(p)));
      setIsFrozen(problems.map(() => false));
      setIsLoading(false);
    }, console.error);
  }, [archive, filepath, mmtUrl, renderOptions.noFrills]);

  if (isLoading || renderOptions.noFrills) return null;
  if (!problems.length) return !showButtonFirst && <i>No problems found.</i>;

  const problem = problems[problemIdx];
  const response = responses[problemIdx];

  if (!startQuiz) {
    return (
      <Button onClick={() => setStartQuiz(true)} variant="contained">
        Quiz Questions For Above Section ({problems.length} problems)
      </Button>
    );
  }
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
