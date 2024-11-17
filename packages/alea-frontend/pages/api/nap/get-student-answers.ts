import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfGetOrSetError,
  executeAndEndSet500OnError,
  getUserIdOrSetError,
} from '../comment-utils';
import { AnswerResponse, ReviewType } from '@stex-react/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfGetOrSetError(req, res)) return;
  const userId = await getUserIdOrSetError(req, res);
  let query = 'where userId=? ';
  const queryPrams: any[] = [userId];
  if (Object.keys(req.query).length > 0) {
    if (req.query.couserId) {
      query += 'And courseId=? ';
      queryPrams.push(req.query.couserId);
    }
    if (req.query.questionId) {
      query += 'And questionId=? ';
      queryPrams.push(req.query.questionId);
    }
    if (req.query.subProblemId) {
      query += 'And subProblemId =? ';
      queryPrams.push(req.query.subProblemId);
    }
  }
  if (!userId) return;
  const answers = await executeAndEndSet500OnError<AnswerResponse[]>(
    `select id,questionId,subProblemId,userId,answer,createdAt,updatedAt,questionTitle from Answer ${query} order by id desc`,
    queryPrams,
    res
  );
  if (answers.length == 0) {
    res.send( answers );
    return;
  }
  const reviewRequests = await executeAndEndSet500OnError<
    { answerId: number; reviewType: ReviewType }[]
  >(
    `SELECT reviewType, answerId FROM
	ReviewRequest
	where answerId in (?)`,
    [answers.map((c) => c.id)],
    res
  );

  const grading = await executeAndEndSet500OnError<{ answerId: number }[]>(
    'select answerId from Grading where answerId in (?) and checkerId <> ?',
    [answers.map((c) => c.id), userId],
    res
  );
  
  res.send(answers.map((c) => {
    return {
      reviewRequests: reviewRequests.filter((d) => d.answerId == c.id).map((d) => d.reviewType),
      graded: grading.filter((d) => d.answerId == c.id).length != 0,
      ...c,
    };
  }));
}
