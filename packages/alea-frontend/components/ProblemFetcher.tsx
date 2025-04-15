import {  FTMLProblemWithSolution } from '@stex-react/api';
import { ProblemResponse } from '@stex-react/ftml-utils';
import { getPoints } from '@stex-react/quiz-utils';
import { ProblemDisplay, ServerLinksContext } from '@stex-react/stex-react-renderer';
import { useContext, useEffect, useState } from 'react';

const ProblemFetcher = ({
  problemUri,
  isFrozen,
  response,
  onResponseUpdate,
}: {
  problemUri: string;
  isFrozen: boolean;
  response?: ProblemResponse;
  onResponseUpdate?: (response: ProblemResponse | undefined, quotient: number) => void;
}) => {
  const { mmtUrl } = useContext(ServerLinksContext);
  const [problem, setProblem] = useState<FTMLProblemWithSolution | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProblem = async () => {
      if (!problemUri) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // TODO alea4
        const fetchedProblem: FTMLProblemWithSolution = {
          problem: {
            html: '',
            title_html: undefined,
            uri: problemUri,
            total_points: 1,
            preconditions: [],
            objectives: [],
          },
          solution: '',
        };
        /*const problemHtml = await getLearningObjectShtml(mmtUrl, problemUri);
        const fetchedProblem = getProblem(problemHtml, '');
        setProblem(fetchedProblem);*/
        if (!isFrozen) onResponseUpdate(undefined, 0);
      } catch (error) {
        console.error('Error fetching problem:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [problemUri, mmtUrl]);

  if (!problemUri) {
    return <i>No problem link provided.</i>;
  }

  if (loading) return <div>Loading problem...</div>;

  return (
    <ProblemDisplay
      problem={problem}
      isFrozen={isFrozen}
      r={response}
      showPoints={false}
      onResponseUpdate={(r) => {
        const points = getPoints(problem, r); 
        console.log('points:', points);
        if (onResponseUpdate) onResponseUpdate(r, points / (problem.problem.total_points || 1));
      }}
    />
  );
};

export default ProblemFetcher;
