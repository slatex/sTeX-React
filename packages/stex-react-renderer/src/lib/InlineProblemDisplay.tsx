import { AutogradableResponse, Input, InputType, Problem, ProblemResponse } from '@stex-react/api';
import { useEffect, useState } from 'react';
import { ProblemDisplay } from './ProblemDisplay';

export function defaultAutogradableResponse(input: Input): AutogradableResponse {
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
  if (!problem?.inputs?.length) {
    return { autogradableResponses: [], freeTextResponses: {} } as ProblemResponse;
  }
  const autogradableResponses: AutogradableResponse[] = [];

  for (const i of problem.inputs) {
    autogradableResponses.push(defaultAutogradableResponse(i));
  }
  return { autogradableResponses, freeTextResponses: {} } as ProblemResponse;
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
