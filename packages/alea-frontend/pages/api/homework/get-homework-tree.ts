import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfGetOrSetError,
  checkIfQueryParameterExistOrSetError,
  executeDontEndSet500OnError,
  getUserIdOrSetError,
} from '../comment-utils';
import { Action, ResourceName } from '@stex-react/utils';
import { isUserIdAuthorizedForAny } from '../access-control/resource-utils';
import { getProblem } from '@stex-react/quiz-utils';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (
    !checkIfGetOrSetError(req, res) ||
    !checkIfQueryParameterExistOrSetError(req, res, 'courseId') ||
    !checkIfQueryParameterExistOrSetError(req, res, 'courseInstance')
  )
    return;

  const courseId = req.query.courseId as string;
  const courseInstance = req.query.courseInstance as string;
  const queryPrams: any = [courseId, courseInstance];
  const isUserModarator = await isUserIdAuthorizedForAny(await getUserIdOrSetError(req, res), [
    {
      action: Action.MUTATE,
      name: ResourceName.COURSE_PROBLEM_REVIEW,
      variables: { courseId, instanceId: courseInstance },
    },
  ]);
  let otherConditions = '';
  if (!isUserModarator) {
    otherConditions += ' And dueTs < ?';
    queryPrams.push(new Date());
  }
  const results: any[] = await executeDontEndSet500OnError(
    `SELECT id, title, givenTs, dueTs, feedbackReleaseTs, problems
    FROM homework 
    WHERE courseId = ? AND courseInstance = ? ` + otherConditions,
    queryPrams,
    res
  );

  Object.keys(JSON.parse(results[0].problems)).map((id) => {
    console.log(getProblem(JSON.parse(results[0].problems)[id]).header, id);

    return {
      title: results[0].problems[id],
      id,
    };
  });
  res.send(
    results.map((c) => ({
      id: c.id,
      title: c.title,
      problems: Object.keys(JSON.parse(c.problems)).map((id) => ({
        header: getProblem(JSON.parse(c.problems)[id]).header,
        id,
      })),
    }))
  );
}
