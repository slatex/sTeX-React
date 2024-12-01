import axios from 'axios';
import { getAuthHeaders, GetLeafConceptsResponse, GetLearningObjectsResponse } from './lms';
const headers = getAuthHeaders();

export async function getLeafConcepts(target: string) {
  const resp = await axios.post(`/api/guided-tours/leaf-concepts`, {
    target,
    headers,
  });
  return resp.data as GetLeafConceptsResponse;
}

export async function getLearningObjects(
  concepts: string[],
  limit?: number,
  types?: string[],
  exclude?: string[]
) {
  const resp = await axios.post(`/api/guided-tours/learning-objects`, {
    concepts,
    limit,
    types,
    exclude,
    headers,
  });
  return resp.data.learningObjects as GetLearningObjectsResponse;
}
