import { Input, InputResponse, InputType, Problem } from '@stex-react/api';
import { useEffect, useState } from 'react';
import { ProblemDisplay } from './ProblemDisplay';

export function defaultInputResponse(input: Input): InputResponse {
  const { type } = input;
  switch (type) {
    case InputType.FILL_IN:
      return { type, filledInAnswer: '' };
    case InputType.MCQ:
      return { type, multipleOptionIdxs: {} };
    case InputType.SCQ:
      return { type, singleOptionIdx: '' };
  }
  return { type };
}

export function defaultProblemResponse(problem: Problem) {
  if (!problem?.inputs?.length) return { responses: [] };
  const responses: InputResponse[] = [];

  for (const i of problem.inputs) {
    responses.push(defaultInputResponse(i));
  }
  return { responses };
}

export function InlineProblemDisplay({ problem }: { problem: Problem }) {
  const [isFrozen, setIsFrozen] = useState(false);

  const [response, setResponse] = useState(defaultProblemResponse(problem));

  useEffect(() => {
    setResponse(defaultProblemResponse(problem));
  }, [problem, problem?.inputs]);

  return (
    <ProblemDisplay
      debug={false}
      problem={problem}
      isFrozen={isFrozen}
      r={response}
      showPoints={false}
      onResponseUpdate={setResponse}
      onFreezeResponse={() => setIsFrozen(true)}
    />
  );
}
