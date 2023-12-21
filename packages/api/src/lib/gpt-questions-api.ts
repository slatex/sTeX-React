import axios from 'axios';
import {
    CreateGptQuestionsRequest,
    CreateGptQuestionsResponse,
    Template
} from './gpt-questions';
import { getAuthHeaders } from './lms';

export async function createGptQuestions(
  request: CreateGptQuestionsRequest
) {
  const resp = await axios.post(`/api/gpt-redirect?apiname=create-questions`, request, {
    headers: getAuthHeaders(),
  });
  return resp.data as CreateGptQuestionsResponse;
}

export async function getTemplates() {
  const resp = await axios.get(`/api/gpt-redirect?apiname=get-templates`, {
    headers: getAuthHeaders(),
  });
  return resp.data as Template[];
}

export async function saveTemplate(template: Template) {
  const resp = await axios.post(`/api/gpt-redirect?apiname=save-template`, template, {
    headers: getAuthHeaders(),
  });
  return resp.data as Template;
}
