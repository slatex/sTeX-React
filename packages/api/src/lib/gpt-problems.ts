import { Tristate } from './quiz';

export interface VariableAssignment {
  // special keys:
  // To be documented.
  key: string;
  value: string;
}

export interface Template {
  templateName: string;
  version: string;
  updateMessage: string;

  templateStrs: string[];
  defaultAssignment: VariableAssignment[];
  updater: string;
  updateTime: string;
}

export type PostProcessingStep = 'JSON_TO_STEX' | 'REMOVE_NEWLINES';

export interface CreateGptProblemsRequest {
  dryRun: boolean;
  templateName: string;
  templateVersion: string;
  templateStrs: string[];
  assignments: VariableAssignment[];
  postProcessingSteps: PostProcessingStep[];
}

export interface GptCompletionData {
  multiAssignment?: VariableAssignment[];
  actualPrompts: string[];
  response: string;
  usage: {
    completionTokens: number;
    promptTokens: number;
    totalTokens: number;
    cost_USD: number;
  };
}

export interface CreateGptProblemsResponse {
  runId: string;
  runTime: string;
  runner: string;
  completions: GptCompletionData[];
}

export interface GptRun {
  request: CreateGptProblemsRequest;
  response: CreateGptProblemsResponse;
}

export type LikertType =
  | 'ambiguous'
  | 'appropriate'
  | 'difficult'
  | 'relevant'
  | 'useful';

export interface LikertRating {
  label: string;
  value: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  scaleSize: 3 | 4 | 5 | 7;
}

export const LikertLabels: { [key in LikertType]: string[] } = {
  appropriate: [  
    // Template: Level of Appropriateness
    'Absolutely inappropriate',
    'Inappropriate',
    'Slightly inappropriate',
    'Neutral',
    'Slightly appropriate',
    'Appropriate',
    'Very appropriate',
  ],
  ambiguous: [
    // Template: Level of Problem
    'Ambiguous',
    'Somewhat ambiguous',
    'Slightly ambiguous',
    'Not at all ambiguous',
  ],
  difficult: [
    // Level of Difficulty
    'Very easy',
    'Easy',
    'Neutral',
    'Difficult',
    'Very difficult',
  ],

  relevant: [
    // Template: Level of Appropriateness
    'Absolutely irrelevant',
    'Irrelevant',
    'Slightly irrelevant',
    'Neutral',
    'Slighlty relevant',
    'Relevant',
    'Very relevant',
  ],
  useful: [
    // Template: Level of Appropriateness
    'Completely useless',
    'Somewhat useless',
    'Slightly useless',
    'Neutral',
    'Slightly useful',
    'Somewhat useful',
    'Very useful',
  ],
  
};

export const LikertScaleSize: { [key in LikertType]: number } = Object.keys(
  LikertLabels
).reduce((acc, likertTypeStr) => {
  const likertType = likertTypeStr as LikertType;
  acc[likertType] = LikertLabels[likertType].length;
  return acc;
}, {} as { [key in LikertType]: number });

export interface ProblemEval {
  relevanceToMaterial?: LikertRating;
  difficulty?: LikertRating;
  useful?: LikertRating;
  appropriateForObjective?: LikertRating;

  // Correctness of the content of the problem.
  doesCompile?: Tristate;
  languageCorrect?: Tristate;
  numContentErrors?: number;
  ambiguous?: LikertRating;
  numMissedAnnotations?: number;
  numWrongAnnotations?: number;
  numMissedImports?: number;
  numWrongImports?: number;

  textDescription?: string;
  fixedProblem?: string;
}

export interface CompletionEval {
  runId: string;
  completionIdx: number;
  version: string;
  evaluator: string;

  textDescription?: string;
  problemEvals: ProblemEval[];
  updateTime: string;
}
