import { useState, useEffect, useContext } from 'react';
import { getLearningObjectShtml } from '@stex-react/api';
import { getPoints, getProblem, hackAwayProblemId } from '@stex-react/quiz-utils';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';
import { defaultProblemResponse } from 'packages/stex-react-renderer/src/lib/InlineProblemDisplay';
import { ProblemDisplay } from 'packages/stex-react-renderer/src/lib/ProblemDisplay';
import { getRandomMessage } from '../pages/guided-tour2/[id]';
import { noTypeMessages } from '../pages/guided-tour2/messages';

const ProblemFetcher = ({ link, onSubmit }) => {
  const { mmtUrl } = useContext(ServerLinksContext); // Context for server URL
  const [problem, setProblem] = useState(null); // Holds the problem data
  const [isFrozen, setIsFrozen] = useState(false); // Controls interactivity
  const [response, setResponse] = useState(null); // Tracks user response
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblem = async () => {
      if (!link) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const problemHtml = await getLearningObjectShtml(mmtUrl, link); // Fetch problem HTML
        const problemId = hackAwayProblemId(problemHtml); // Extract problem ID
        const fetchedProblem = getProblem(problemId, ''); // Get full problem data
        setProblem(fetchedProblem);
        setResponse(defaultProblemResponse(fetchedProblem)); // Initialize response
      } catch (error) {
        console.error('Error fetching problem:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [link, mmtUrl]);

  const handleUserSubmit = () => {
    const maxPoints = problem.points;
    const points = getPoints(problem, response);

    let result;
    if (points === 0) result = 'incorrect';
    else if (points > 0 && points < maxPoints) result = 'partial correct';
    else if (points === maxPoints) result = 'correct';
    setIsFrozen(true);
    if (onSubmit) {
      onSubmit(result);
    }
  };
  if (!link) {
    return (
      <div>
        <p> {getRandomMessage(noTypeMessages, 'problem')}</p>
      </div>
    );
  }

  if (loading) return <div>Loading problem...</div>;

  return (
    <div>
      <ProblemDisplay
        problem={problem}
        isFrozen={isFrozen}
        r={response}
        showPoints={false}
        onResponseUpdate={setResponse}
      />
      {!isFrozen && (
        <div style={{ textAlign: 'right', marginTop: '10px' }}>
          <button onClick={handleUserSubmit} style={{ padding: '8px 16px', fontSize: '16px' }}>
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default ProblemFetcher;
