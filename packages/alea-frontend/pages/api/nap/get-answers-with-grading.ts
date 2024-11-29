import {
  GetAnswersWithGradingResponse,
  GradingAnswerClass,
  GradingInfo,
  ProblemResponse,
  ReviewType,
} from '@stex-react/api';
import { Action, ResourceName } from '@stex-react/utils';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserIdIfAuthorizedOrSetError } from '../access-control/resource-utils';
import { checkIfQueryParameterExistOrSetError, executeAndEndSet500OnError } from '../comment-utils';
import {
  getAllAnswersForHomeworkOrSetError,
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
  if (!checkIfQueryParameterExistOrSetError(req, res, ['questionId', 'studentId'])) return;
  const questionId = req.query.questionId as string;
  const studentId = req.query.studentId as string;
  const homeworkId = +(req.query.homeworkId as string);
  if (!homeworkId || isNaN(homeworkId)) return res.status(422).send('Missing params.');
  const homework = await getHomeworkOrSetError(homeworkId, false, res);
  if (!homework) return;
  const checkerId = await getUserIdIfAuthorizedOrSetError(
    req,
    res,
    ResourceName.COURSE_HOMEWORK,
    Action.INSTRUCTOR_GRADING,
    { courseId: homework.courseId, instanceId: homework.courseInstance }
  );
  if (!checkerId) return;

  const answers = await getAllAnswersForHomeworkOrSetError(studentId, homeworkId, questionId, res);
  if (!answers) return;

  const problemAnswers = answers[questionId];
  const response: ProblemResponse = {
    autogradableResponses: [],
    freeTextResponses: {},
  };

  Object.entries(problemAnswers || {}).forEach(([subProblemId, answerEntry]) => {
    response.freeTextResponses[subProblemId] = answerEntry.answer;
  });

  const subProblemIdToAnswerId = convertToSubProblemIdToAnswerId(problemAnswers);
  const grades = await getAllGradingsOrSetError(subProblemIdToAnswerId, res);
  if (!grades) return;
  res.send({
    answers: response,
    subProblemIdToAnswerId,
    subProblemIdToGrades: grades,
  } as GetAnswersWithGradingResponse);
}