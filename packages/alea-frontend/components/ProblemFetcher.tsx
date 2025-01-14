import { getLearningObjectShtml, Problem, ProblemResponse } from '@stex-react/api';
import { getPoints, getProblem, hackAwayProblemId } from '@stex-react/quiz-utils';
import {
  defaultProblemResponse,
  ProblemDisplay,
  ServerLinksContext,
} from '@stex-react/stex-react-renderer';
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
  onResponseUpdate?: (response: ProblemResponse, quotient: number) => void;
}) => {
  const { mmtUrl } = useContext(ServerLinksContext);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProblem = async () => {
      if (!problemUri) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const problemHtml = await getLearningObjectShtml(mmtUrl, problemUri);
        const problemId = hackAwayProblemId(problemHtml);
        const fetchedProblem = getProblem(problemId, '');
        setProblem(fetchedProblem);
        if (!isFrozen) onResponseUpdate(defaultProblemResponse(fetchedProblem), 0);
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
        if (onResponseUpdate) onResponseUpdate(r, points / (problem.points || 1));
      }}
    />
  );
};

export default ProblemFetcher;
