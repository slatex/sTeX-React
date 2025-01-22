import { NextApiRequest, NextApiResponse } from 'next';
import { executeAndEndSet500OnError } from './comment-utils';
import { getCourseEnrollmentAcl } from '../course-home/[courseId]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { courseId, instanceId } = req.query;
    if (!courseId || !instanceId) {
      return res.status(400).json({ error: 'Missing courseId or instanceId in query parameters.' });
    }
    const aclId = getCourseEnrollmentAcl(courseId as string, instanceId as string);
    const students = await executeAndEndSet500OnError(
      'SELECT memberUserId FROM ACLMembership WHERE parentACLId = ?',
      [aclId],
      res
    );
    const userIds = students.map((row: { memberUserId: string }) => row.memberUserId);
    return res.status(200).json(userIds);
  } catch (error) {
    console.error('Error fetching enrolled students:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}