import { FTMLProblemWithSolution } from '@stex-react/api';
import { getAllQuizzes } from '@stex-react/node-utils';
import { NextApiRequest, NextApiResponse } from 'next';
import { queryGradingDbAndEndSet500OnError } from '../grading-db-utils';
import { checkIfGetOrSetError, checkIfPostOrSetError, getUserIdOrSetError } from '../comment-utils';
import { Action, ResourceName } from '@stex-react/utils';
import { getUserIdIfAuthorizedOrSetError } from '../access-control/resource-utils';
import {
  filterChangedResults,
  getCorrectedPoints,
  GradingDbData,
  prepareProblemTitles,
} from './recorrect';
import { isMemberOfAcl } from '../acl-utils/acl-common-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfPostOrSetError(req, res)) return;

  const userId = await getUserIdOrSetError(req, res);
  const isSysAdmin = await isMemberOfAcl('sys-admin', userId);
  console.log('isSysAdmin', isSysAdmin, userId);
  if (!isSysAdmin) return;

  try {
    const quizzes = getAllQuizzes();

    const problems: { [problemUri: string]: FTMLProblemWithSolution } = {};
    for (const quiz of quizzes) {
      for (const [problemId, problem] of Object.entries(quiz.problems)) {
        problems[problemId] = problem;
      }
    }

    const results: GradingDbData[] = await queryGradingDbAndEndSet500OnError(
      'SELECT gradingId, userId, problemId, quizId, response, points FROM grading WHERE browserTimestamp_ms > 1745366400000',
      [],
      res
    );

    const { results: withCorrectedPoints, missingIds } = await getCorrectedPoints(
      problems,
      results
    );

    const changedResults = filterChangedResults(withCorrectedPoints);

    const changesByQuiz = changedResults.reduce((acc, result) => {
      const quiz = quizzes.find((q) => q.id === result.quizId);
      if (!quiz) return acc;

      const key = `${quiz.courseId}-${quiz.courseTerm}-${result.quizId}`;
      if (!acc[key]) {
        acc[key] = {
          courseId: quiz.courseId,
          courseTerm: quiz.courseTerm,
          quizId: result.quizId,
          changes: [],
        };
      }
      acc[key].changes.push({
        gradingId: result.gradingId,
        problemId: result.problemId,
        oldPoints: result.points,
        newPoints: result.correctedPoints,
        studentId: result.userId,
      });
      return acc;
    }, {});

    const problemTitles = {};
    for (const quiz of quizzes) {
      Object.assign(problemTitles, prepareProblemTitles(quiz));
    }
    console.log('problemUri', problemTitles);

    return res.status(200).json({
      totalChanges: changedResults.length,
      changesByQuiz: Object.values(changesByQuiz),
      missingProblemUri: missingIds,
      problems: problemTitles,
    });
  } catch (error) {
    console.error('Error in global recorrection check:', error);
    return res.status(500).send('Internal server error');
  }
}
