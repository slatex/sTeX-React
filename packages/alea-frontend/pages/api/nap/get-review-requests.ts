import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfGetOrSetError,
  checkIfQueryParameterExistOrSetError,
  executeAndEndSet500OnError,
} from '../comment-utils';
import { ReviewType } from '@stex-react/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (
    !checkIfGetOrSetError(req, res) ||
    !checkIfQueryParameterExistOrSetError(req, res, 'reviewType')
  )
    return;
  const reviewType: ReviewType = ReviewType[req.query.reviewType.toString()];
  const queryPrams: any[] = [reviewType];
  let query = `SELECT Answer.questionId FROM ReviewRequest INNER JOIN Answer ON ReviewRequest.answerId = Answer.id where ReviewRequest.reviewType=? `;
  if (Object.keys(req.query).length > 0) {
    if (req.query.couserId != null) {
      query += 'And Answer.courseId=? ';
      queryPrams.push(req.query.couserId);
    }
  }
  query += 'GROUP BY Answer.questionId';
  const questonsid = (
    await executeAndEndSet500OnError<{ questionId: string }[]>(query, queryPrams, res)
  ).map((c) => c.questionId);
  const reviewRequests = await executeAndEndSet500OnError<
    { questionId: string; questionTitle: string; answerId: number }[]
  >(
    'SELECT ReviewRequest.id,Answer.questionId,Answer.subProblemId,Answer.answer,Answer.questionTitle,Answer.createdAt,Answer.updatedAt FROM ReviewRequest INNER JOIN Answer ON ReviewRequest.answerId = Answer.id where Answer.questionId in (?) and ReviewRequest.reviewType=?',
    [questonsid,reviewType],
    res
  );
  const resultx: { answers: any[]; questionTitle: string }[] = [];
  for (const questionId of questonsid) {
    const master = reviewRequests.filter((c) => c.questionId === questionId)[0];
    resultx.push({
      answers: [],
      questionTitle: master.questionTitle,
    });
    for (const item of reviewRequests.filter((c) => c.questionId === questionId)) {
      resultx.at(-1).answers.push(item);
    }
  }
  res.send(resultx);
}
