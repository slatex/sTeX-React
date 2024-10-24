import { AnswerResponse, ReviewType } from '@stex-react/api';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  checkIfGetOrSetError,
  getUserIdOrSetError,
  executeAndEndSet500OnError,
} from '../comment-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfGetOrSetError(req, res)) return;

  let query = 'where homeworkId is not null ';
  const queryPrams: any[] = [];
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

  const answers = await executeAndEndSet500OnError<AnswerResponse[]>(
    `select id,questionId,subProblemId,userId,answer,createdAt,updatedAt,questionTitle from Answer ${query} order by id desc`,
    queryPrams,
    res
  );
  if (answers.length == 0) {
    res.send(answers);
    return;
  }

  const grading = await executeAndEndSet500OnError<{ answerId: number }[]>(
    'select answerId from Grading where answerId in (?)',
    [answers.map((c) => c.id)],
    res
  );

  res.send(
    answers.map((c) => {
      return {
        reviewRequests: null,
        graded: grading.filter((d) => d.answerId == c.id).length != 0,
        ...c,
      };
    })
  );
}
