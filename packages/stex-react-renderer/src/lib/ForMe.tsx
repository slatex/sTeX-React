import { Box, Button, CircularProgress, Typography } from '@mui/material';
import {
  getDefiniedaInSection,
  getLearningObjects,
  getLearningObjectShtml,
  Problem,
  ProblemResponse,
} from '@stex-react/api';
import { useRouter } from 'next/router';
import { useContext, useEffect, useReducer, useState } from 'react';
import { getLocaleObject } from './lang/utils';
import { ProblemDisplay } from './ProblemDisplay';
import { ListStepper } from './QuizDisplay';
import { ServerLinksContext } from './stex-react-renderer';

export function ForMe({
  sectionUri,
  showHideButton = false,
}: {
  sectionUri: string;
  showHideButton?: boolean;
}) {
  const t = getLocaleObject(useRouter()).quiz;
  const { mmtUrl } = useContext(ServerLinksContext);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(true);
  const [startQuiz, setStartQuiz] = useState(false);
  const [problemIds, setProblemIds] = useState<string[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [responses, setResponses] = useState<ProblemResponse[]>([]);
  const [isFrozen, setIsFrozen] = useState<boolean[]>([]);
  const [problemIdx, setProblemIdx] = useState(0);
  const [isLoadingProblems, setIsLoadingProblems] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [, forceRerender] = useReducer((x) => x + 1, 0);

  const handleClick = async () => {
    setShow(false);
    setLoading(true);
    try {
      const data = await getDefiniedaInSection(sectionUri);
      const URIs = data?.flatMap((item) => item.conceptUri) || [];

      const fetchedResponse = await getLearningObjects(
        URIs,
        30,
        ['problem'],
        undefined,
        { remember: 0.2, understand: 0.2 },
        { remember: 0.85, understand: 0.85 }
      );
      const extractedProblemIds =
        fetchedResponse?.['learning-objects']?.map((lo: any) => lo['learning-object']) || [];

      setProblemIds(extractedProblemIds);

      if (extractedProblemIds.length > 0) {
        setStartQuiz(true);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!startQuiz || problemIds.length === 0) return;

    const loadProblems = async () => {
      setIsLoadingProblems(true);
      try {
        const problemShtmls = await Promise.all(
          problemIds.map((id) => getLearningObjectShtml(mmtUrl, id))
        );

        // const parsedProblems = problemShtmls.map((p) => getProblem(hackAwayProblemId(p), ''));
        // setProblems(parsedProblems);
        // setResponses(parsedProblems.map((p) => defaultProblemResponse(p)));
        setIsFrozen(problemShtmls.map(() => false));
        setProblemIdx(0);
      } catch (error) {
        console.error('Error loading problems:', error);
      } finally {
        setIsLoadingProblems(false);
      }
    };

    loadProblems();
  }, [startQuiz, problemIds, mmtUrl]);

  if (show) {
    return (
      <Button onClick={handleClick} variant="contained">
        {t.ForMe}
      </Button>
    );
  }

  if (loading || isLoadingProblems) {
    return (
      <Box p={2} bgcolor="white" border="1px solid #CCC" borderRadius="5px">
        <Typography variant="h6">For Me</Typography>
        <CircularProgress />
      </Box>
    );
  }

  if (!startQuiz || problemIds.length === 0) {
    return (
      <Box p={2} bgcolor="white" border="1px solid #CCC" borderRadius="5px">
        <Typography variant="h6">For Me</Typography>
        <Typography variant="body2" color="textSecondary">
          No Practice Questions Available
        </Typography>
      </Box>
    );
  }

  const problem = problems[problemIdx];
  const response = responses[problemIdx];
  if (!problem || !response) {
    return (
      <Box p={2} bgcolor="white" border="1px solid #CCC" borderRadius="5px">
        <Typography variant="h6">For Me</Typography>
        <Typography color="error">Error loading problem</Typography>
      </Box>
    );
  }

  return (
    <Box p={2} maxWidth="800px" m="auto" bgcolor="white" border="1px solid #CCC" borderRadius="5px">
      <Typography variant="h6" mb={2}>
        {t.ForMe}
      </Typography>
      <Typography fontWeight="bold" textAlign="left">
        {`${t.problem} ${problemIdx + 1} ${t.of} ${problems.length} `}
      </Typography>
      <ListStepper
        idx={problemIdx}
        listSize={problems.length}
        onChange={(idx) => {
          setProblemIdx(idx);
          setShowSolution(false);
        }}
      />
      <Box mb={2}>
        <ProblemDisplay
          r={response}
          uri={problemIds[problemIdx]}
          showPoints={false}
          problem={problem}
          isFrozen={isFrozen[problemIdx]}
          onResponseUpdate={(updatedResponse) => {
            forceRerender();
            setResponses((prev) => {
              const newResponses = [...prev];
              newResponses[problemIdx] = updatedResponse;
              return newResponses;
            });
          }}
          onFreezeResponse={() =>
            setIsFrozen((prev) => {
              const newFrozen = [...prev];
              newFrozen[problemIdx] = true;
              return newFrozen;
            })
          }
        />
      </Box>
      <Box
        mb={2}
        sx={{ display: 'flex', gap: '10px', flexDirection: 'column', alignItems: 'flex-start' }}
      >
        {showHideButton && (
          <Button onClick={() => setShow(true)} variant="contained">
            {t.hideForMe}
          </Button>
        )}
      </Box>
    </Box>
  );
}
