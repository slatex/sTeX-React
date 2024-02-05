import {
  BloomDimension,
  GenericCognitiveValues,
  LMSEvent,
  NumericCognitiveValues,
  SmileyCognitiveValues,
  cleanupNumericCognitiveValues,
  cleanupSmileyCognitiveValues,
  getAllMyData,
  getUriSmileys,
  getUriWeights,
  lmsRequest,
  reportEvent,
} from './lms';

export const USE_LMS_V1 = process.env['NEXT_PUBLIC_USE_LMS_V1'] !== 'false';

export type CognitiveValueConfidence = NumericCognitiveValues;

export interface LMS2Event {
  learner?: string; // The user id.
  time?: string; // Format: '2022-11-24 19:19:18'
  payload?: string; // Any string with arbitrary extra information to be used internally.
  comment?: string; // Any string with arbitrary extra information to show the learner.
}

export interface ProblemAnswerEvent extends LMS2Event {
  type: 'problem-answer';
  uri: string; // The problem uri (eg. http://mathhub.info/iwgs/quizzes/creative_commons_21.tex)
  score?: number; // The score of the learner.
  'max-points'?: number; // The maximum points of the problem.
  updates?: {
    concept?: string; // The concept id.
    dimension?: BloomDimension[]; // The dimension id.
    quotient?: number; // float between 0.0 and 1.0 indicating how well the learner did for this concept/dimension.
  }[];
}

export interface CourseInitEvent extends LMS2Event {
  type: 'course-init';
  course: string; // The course id.
  grade?: string; // "1" to "5"
  percentage?: string; // "0" to "100"
}

export interface IKnowEvent extends LMS2Event {
  type: 'i-know';
  // For i-know (a.k.a I understand)
  concept?: string;
}

export interface SelfAssessmentEvent extends LMS2Event {
  type: 'self-assessment';
  concept: string;
  competencies: NumericCognitiveValues;
}

export interface SelfAssessmentSmileysEvent extends LMS2Event {
  type: 'self-assessment-5StepLikertSmileys';
  concept: string;
  competencies: SmileyCognitiveValues;
}

export interface PurgeEvent extends LMS2Event {
  type: 'purge';
}

export interface ConceptClickedEvent extends LMS2Event {
  type: 'concept-clicked';
  concept: string;
}

export interface ConceptHoveredEvent extends LMS2Event {
  type: 'concept-hovered';
  concept: string;
}

export interface DefiniendumReadEvent extends LMS2Event {
  type: 'definiendum-read';
  concept: string;
}

export interface ViewEvent extends LMS2Event {
  type: 'view';
  concept: string;
}

export interface LoginEvent extends LMS2Event {
  type: 'login';
}

export interface LmsOutputMultipleRequest {
  concepts: string[];
  'special-output'?: string;
  'include-confidence'?: boolean;
}

export interface ConceptCompetenceInfo {
  concept: string; // URI
  competences: GenericCognitiveValues;
  confidences?: CognitiveValueConfidence;
}

export interface LmsOutputMultipleResponse {
  learner: string;
  model: ConceptCompetenceInfo[];
}

export async function getUriWeightsV2(
  concepts: string[]
): Promise<NumericCognitiveValues[]> {
  if (USE_LMS_V1) return await getUriWeights(concepts);

  if (!concepts?.length) return [];
  const data: LmsOutputMultipleResponse = await lmsRequest(
    'lms/output/multiple',
    'POST',
    null,
    {
      concepts,
      'include-confidence': false,
    } as LmsOutputMultipleRequest
  );
  if (!data?.model) return new Array(concepts.length).fill({});

  const compMap = new Map<string, NumericCognitiveValues>();
  data.model.forEach((c) => {
    compMap.set(
      c.concept,
      cleanupNumericCognitiveValues(c.competences as NumericCognitiveValues)
    );
  });
  return concepts.map(
    (concept) => compMap.get(concept) || cleanupNumericCognitiveValues({})
  );
}

export async function getUriSmileysV2(
  concepts: string[],
  inputHeaders?: any
): Promise<Map<string, SmileyCognitiveValues>> {
  if (USE_LMS_V1) return await getUriSmileys(concepts);

  if (!concepts?.length) return new Map();
  const data: LmsOutputMultipleResponse = await lmsRequest(
    'lms/output/multiple',
    'POST',
    null,
    {
      concepts,
      'special-output': '5StepLikertSmileys',
      'include-confidence': false,
    },
    inputHeaders
  );
  const compMap = new Map<string, SmileyCognitiveValues>();
  if (!data?.model) return compMap;
  data.model.forEach((c) => {
    compMap.set(
      c.concept,
      cleanupSmileyCognitiveValues(c.competences as SmileyCognitiveValues)
    );
  });

  concepts.map((concept) => {
    if (!compMap.has(concept))
      compMap.set(concept, cleanupSmileyCognitiveValues({}));
  });
  return compMap;
}

export async function getAllMyDataV2(): Promise<{
  learner: string;
  model: ConceptCompetenceInfo[];
  logs: {
    answers: ProblemAnswerEvent[];
    'course-inits': CourseInitEvent[];
    'i-knows': IKnowEvent[];
    logins: LoginEvent[];
    purges: PurgeEvent[];
    'self-assessments': SelfAssessmentEvent | SelfAssessmentSmileysEvent[];
    views: any[];
  };
}> {
  // Its the same request for v1 so no change needed because this function is
  // only used by the JSON dumper.
  return await lmsRequest('lms/output/all_my_data', 'POST', {}, {});
}

export async function getMyCompleteModel(): Promise<ConceptCompetenceInfo[]> {
  if (USE_LMS_V1) {
    const v1Model: { URI: string; values: { [key: string]: string } }[] = (
      await getAllMyData()
    ).model;
    return v1Model.map((c) => ({
      concept: c.URI,
      competences: cleanupNumericCognitiveValues(
        c.values as NumericCognitiveValues
      ),
    }));
  }
  return (await getAllMyDataV2())?.model || [];
}

function toLMSEvent(event: LMS2Event): LMSEvent {
  const type = (event as any)?.type as string;
  switch (type) {
    case 'problem-answer':
    case 'view':
    case 'self-assessment':
    case 'concept-clicked':
    case 'concept-hovered':
    case 'definiendum-read':
      console.error(`[${type}] event is not supported in LMS v1`);
      return undefined as unknown as LMSEvent;
    case 'purge':
    case 'login':
      throw new Error(`[${type}] event is not reportable`);
    case 'course-init':
      return {
        type: 'course-init',
        course: (event as CourseInitEvent).course,
        grade: (event as CourseInitEvent).grade,
        percentage: (event as CourseInitEvent).percentage,
      };
    case 'i-know':
      return {
        type: 'i-know',
        URI: (event as IKnowEvent).concept,
      };
    case 'self-assessment-5StepLikertSmileys':
      return {
        type: 'self-assessment-5StepLikertSmileys',
        URI: (event as SelfAssessmentSmileysEvent).concept,
        values: (event as SelfAssessmentSmileysEvent).competencies,
      };
    default:
      return event as LMSEvent;
  }
}

export async function reportEventV2(event: LMS2Event) {
  if (USE_LMS_V1) return await reportEvent(toLMSEvent(event));
  return await lmsRequest('lms/input/events', 'POST', {}, event);
}
