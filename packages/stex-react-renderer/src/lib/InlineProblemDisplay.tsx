import {
  AutogradableResponse,
  FTMLProblemWithSolution,
  Input,
  InputType,
  ProblemResponse,
} from '@stex-react/api';

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

export function defaultProblemResponse(problem: FTMLProblemWithSolution) {
  return { uri: '', responses: [] } as ProblemResponse;

/* TODO alea4  if (!problem?.inputs?.length) {
  }
  const autogradableResponses: AutogradableResponse[] = [];

  for (const i of problem.inputs) {
    autogradableResponses.push(defaultAutogradableResponse(i));
  }
  return { autogradableResponses, freeTextResponses: {} } as ProblemResponse;*/
}
