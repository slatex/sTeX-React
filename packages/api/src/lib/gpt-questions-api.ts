import axios from 'axios';
import {
  CompletionEval,
  CreateGptQuestionsRequest,
  CreateGptQuestionsResponse,
  GptRun,
  Template,
} from './gpt-questions';
import { getAuthHeaders } from './lms';

export async function createGptQuestions(request: CreateGptQuestionsRequest) {
  const resp = await axios.post(
    `/api/gpt-redirect?apiname=create-questions`,
    request,
    {
      headers: getAuthHeaders(),
    }
  );
  return resp.data as CreateGptQuestionsResponse;
}

export async function getTemplates() {
  const resp = await axios.get(`/api/gpt-redirect?apiname=get-templates`, {
    headers: getAuthHeaders(),
  });
  return resp.data as Template[];
}

export async function saveTemplate(template: Template) {
  const resp = await axios.post(
    `/api/gpt-redirect?apiname=save-template`,
    template,
    {
      headers: getAuthHeaders(),
    }
  );
  return resp.data as Template;
}

export async function getGptRuns() {
  const resp = await axios.get(`/api/gpt-redirect?apiname=get-runs`, {
    headers: getAuthHeaders(),
  });
  return resp.data as GptRun[];
}

export async function saveEval(
  runId: string,
  completionIdx: number,
  evaluation: CompletionEval
) {
  const resp = await axios.post(
    `/api/gpt-redirect?apiname=save-eval`,
    evaluation,
    {
      headers: getAuthHeaders(),
    }
  );
  return resp.data as GptRun;
}

export async function getEval(runId: string, completionIdx: number) {
  const resp = await axios.get(
    `/api/gpt-redirect?apiname=get-eval/${runId}/${completionIdx}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return resp.data as CompletionEval;
}
