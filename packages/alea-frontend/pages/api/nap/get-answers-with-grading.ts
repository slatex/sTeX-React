import { FTML } from '@kwarc/ftml-viewer';
import { GradingAnswerClass, GradingInfo, ReviewType } from '@stex-react/api';

import { Action, CURRENT_TERM, ResourceName } from '@stex-react/utils';
import { NextApiRequest, NextApiResponse } from 'next';
import { isUserIdAuthorizedForAny } from '../access-control/resource-utils';
import {
  checkIfQueryParameterExistOrSetError,
  executeAndEndSet500OnError,
  getUserIdOrSetError,
} from '../comment-utils';
import {
  getAllAnswersForHomeworkOrSetError,
  getAllAnswersForQuestion,
  getHomeworkOrSetError,
} from '../homework/get-homework';

export async function getAllGradingsOrSetError(
  subProblemToAnswerIds: Record<string, number>,
  res: NextApiResponse
) {
  if (Object.keys(subProblemToAnswerIds).length === 0) return {};

  const latestGrades = await executeAndEndSet500OnError<GradingInfo[]>(
    `SELECT id, checkerId, reviewType, answerId, customFeedback, totalPoints, createdAt, updatedAt
    FROM Grading
    WHERE (checkerId, answerId, updatedAt) IN (
      SELECT checkerId, answerId, MAX(updatedAt) AS updatedAt
      FROM Grading
      WHERE answerId IN (?)
      GROUP BY 1, 2
    )`,
    [Object.values(subProblemToAnswerIds)],
    res
  );
  if (!latestGrades) return;
  const latestInstructorGrade = latestGrades
    .filter((g) => g.reviewType === ReviewType.INSTRUCTOR)
    .sort((a, b) => {
      if (b.updatedAt < a.updatedAt) return -1;
      else return 1;
    })[0];
  const grades = latestGrades.filter(
    (g) => g.reviewType !== ReviewType.INSTRUCTOR || g.id === latestInstructorGrade?.id
  );

  const gradesAnswerClasses = !grades.length
    ? []
    : await executeAndEndSet500OnError<GradingAnswerClass[]>(
        `SELECT id, answerClassId, gradingId, points, isTrait, closed, title, description, count 
    FROM GradingAnswerClass 
    WHERE gradingId in (?)`,
        [grades.map((c) => c.id)],
        res
      );
  if (!gradesAnswerClasses) return;

  for (const grade of grades) {
    grade.answerClasses = gradesAnswerClasses.filter((c) => c.gradingId == grade.id);
  }

  const subProblemIdToGrades: Record<string, GradingInfo[]> = {};
  Object.entries(subProblemToAnswerIds).forEach(([subProblemId, answerId]) => {
    subProblemIdToGrades[subProblemId] = grades.filter((g) => g.answerId === answerId);
  });
  return subProblemIdToGrades;
}

export function convertToSubProblemIdToAnswerId(
  problemAnswers?: Record<string, { answer: string; id: number }>
) {
  return Object.entries(problemAnswers || {}).reduce((acc, [subProblemId, { id }]) => {
    acc[subProblemId] = id;
    return acc;
  }, {} as Record<string, number>);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfQueryParameterExistOrSetError(req, res, ['questionId'])) return;
  const questionId = req.query.questionId as string;
  let studentId: null | string = req.query?.studentId as string;
  const homeworkId = +(req.query.homeworkId as string);
  const answerId = +(req.query.answerId as string);
  const courseId = req.query.courseId as string;
  const instanceId = (req.query.courseInstance as string) ?? CURRENT_TERM;
  if (!studentId) {
    const userIdquery = await executeAndEndSet500OnError<any[]>(
      `select userId from Answer where id = ?`,
      [answerId],
      res
    );

    studentId = (userIdquery[0]?.userId as string) ?? '';
  }
  if (!homeworkId || isNaN(homeworkId)) {
    const answers = await getAllAnswersForQuestion(studentId, questionId, res);
    if (!answers) return;

    const problemAnswers = answers[questionId];
    const subProblemIdToAnswerId = convertToSubProblemIdToAnswerId(problemAnswers);
    const grades = await getAllGradingsOrSetError(subProblemIdToAnswerId, res);
    const response: FTML.ProblemResponse = {
      // TODO ALEA4-P4
      uri: '',
      responses: [],
      // freeTextResponses: {},
    };

    Object.entries(problemAnswers || {}).forEach(([subProblemId, answerEntry]) => {
      // TODO ALEA4-P4
      response.responses[subProblemId] = answerEntry.answer;
    });
    /*res.send({
      answers: response,
      subProblemIdToAnswerId,
      subProblemIdToGrades: grades,
    } as GetAnswersWithGradingResponse);*/ // TODO ALEA4-P4
    res.send(undefined);
    return;
  }

  const homework = await getHomeworkOrSetError(homeworkId, false, res);
  if (!homework) return;
  // const checkerId = await getUserIdIfAuthorizedOrSetError(
  //   req,
  //   res,
  //   ResourceName.COURSE_HOMEWORK,
  //   Action.INSTRUCTOR_GRADING,
  //   { courseId: homework.courseId, instanceId: homework.courseInstance }
  // );
  // if (!checkerId) return;

  const answers = await getAllAnswersForHomeworkOrSetError(studentId, homeworkId, questionId, res);
  if (!answers) return;

  const problemAnswers = answers[questionId];
  const response: FTML.ProblemResponse = {
    uri: '',
    responses: [],
    // TODO ALEA4-P4 autogradableResponses: [],
    //freeTextResponses: {},
  };

  Object.entries(problemAnswers || {}).forEach(([subProblemId, answerEntry]) => {
    // TODO ALEA4-P4
    response.responses[subProblemId] = answerEntry.answer;
  });

  const subProblemIdToAnswerId = convertToSubProblemIdToAnswerId(problemAnswers);
  const grades = await getAllGradingsOrSetError(subProblemIdToAnswerId, res);
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;
  const isInstructor = await isUserIdAuthorizedForAny(userId, [
    {
      name: ResourceName.COURSE_HOMEWORK,
      action: Action.INSTRUCTOR_GRADING,
      variables: { courseId: courseId, instanceId: instanceId },
    },
  ]);
  if (!isInstructor) {
    const isStudent = await isUserIdAuthorizedForAny(userId, [
      {
        name: ResourceName.COURSE_HOMEWORK,
        action: Action.TAKE,
        variables: {
          courseId,
          instanceId,
        },
      },
    ]);
    if (!isStudent) return;
  }
  if (!grades) return;
  /*res.send({
    answers: response,
    subProblemIdToAnswerId,
    subProblemIdToGrades: isInstructor ? grades : null,
  } as GetAnswersWithGradingResponse);*/ // TODO ALEA4-P4
  res.send(undefined);
}
