import { NextApiRequest, NextApiResponse } from 'next';
import {
    executeAndEndSet500OnError,
    getUserIdOrSetError,
} from '../comment-utils';
import { GetSortedCoursesByConnectionStudybody, isModerator } from '@stex-react/api';
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const userId = await getUserIdOrSetError(req, res);
    if (!userId) return;

    if (!isModerator(userId)) {
        res.status(403).send({ message: 'Unauthorized.' });
        return;
    }
    const result: GetSortedCoursesByConnectionStudybody[] = await executeAndEndSet500OnError(`
    SELECT
	COUNT(courseId) as member,courseId
    FROM
	StudyBuddyUsers
    GROUP BY
	courseId
    ORDER BY
    member DESC`, [], res);
    res.status(200).json(result);
}