import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfGetOrSetError,
  checkIfQueryParameterExistOrSetError,
  executeAndEndSet500OnError,
  getUserIdOrSetError,
} from '../comment-utils';
import { ReviewType } from '@stex-react/api';
import { isUserIdAuthorizedForAny } from '../access-control/resource-utils';
import { Action, ResourceName } from '@stex-react/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (
    !checkIfGetOrSetError(req, res) ||
    !checkIfQueryParameterExistOrSetError(req, res, 'courseId') ||
    !checkIfQueryParameterExistOrSetError(req, res, 'courseInstance')
  )
    return;
  const courseId = req.query.courseId.toString();
  const courseInstance = req.query.courseInstance.toString();
  const reviewType = (await isUserIdAuthorizedForAny(await getUserIdOrSetError(req, res), [
    {
      action: Action.MUTATE,
      name: ResourceName.COURSE_PROBLEM_REVIEW,
      variables: { courseId, instanceId: courseInstance },
    },
  ]))
    ? ReviewType.INSTRUCTOR
    : ReviewType.PEER;
  const questonsid = (
    await executeAndEndSet500OnError<{ questionId: string }[]>(
      `SELECT Answer.questionId FROM ReviewRequest INNER JOIN Answer ON ReviewRequest.answerId = Answer.id where ReviewRequest.reviewType=? And Answer.courseId=? GROUP BY Answer.questionId`,
      [reviewType, courseId],
      res
    )
  ).map((c) => c.questionId);
  if (questonsid.length === 0) {
    res.send([]);
    return;
  }
  const reviewRequests = await executeAndEndSet500OnError<
    { questionId: string; questionTitle: string; answerId: number }[]
  >(
    'SELECT ReviewRequest.id,Answer.questionId,Answer.subProblemId,Answer.answer,Answer.questionTitle,Answer.createdAt,Answer.updatedAt FROM ReviewRequest INNER JOIN Answer ON ReviewRequest.answerId = Answer.id where Answer.questionId in (?) and ReviewRequest.reviewType=?',
    [questonsid, reviewType],
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
