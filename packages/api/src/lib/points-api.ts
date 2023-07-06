import axios from 'axios';
import { getAuthHeaders } from './lms';
import { GrantReason } from './points';

export async function grantPoints(
  commentId: number,
  points: number,
  reason: GrantReason
) {
  const headers = getAuthHeaders();
  return await axios.post(
    '/api/grant-points',
    { commentId, reason, points },
    { headers }
  );
}
