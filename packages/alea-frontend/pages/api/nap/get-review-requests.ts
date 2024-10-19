import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfGetOrSetError, executeAndEndSet500OnError } from '../comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfGetOrSetError(req, res)) return;
  const queryPrams = [];
  let query = `SELECT Answer.questionId FROM ReviewRequest INNER JOIN Answer ON ReviewRequest.answerId = Answer.id `;
  if (Object.keys(req.query).length > 0) {
    query += 'where ';
    if (req.query.couserId != null) {
      query += 'Answer.courseId=? ';
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
    'SELECT ReviewRequest.id,Answer.questionId,Answer.subProblemId,Answer.answer,Answer.questionTitle,Answer.createdAt,Answer.updatedAt FROM ReviewRequest INNER JOIN Answer ON ReviewRequest.answerId = Answer.id where Answer.questionId in (?)',
    [questonsid],
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
