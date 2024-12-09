import { GetCourseGradingItemsResponse, GradingItem, ReviewType } from '@stex-react/api';
import { Action, CURRENT_TERM, ResourceName } from '@stex-react/utils';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserIdIfAuthorizedOrSetError } from '../access-control/resource-utils';
import { checkIfGetOrSetError, executeDontEndSet500OnError } from '../comment-utils';
import { getAllHomeworksOrSetError } from '../homework/get-homework-list';

interface PerSubProblemGradingType {
  homeworkId: number;
  questionId: string;
  studentId: string;

  subProblemId: string;
  reviewType?: ReviewType;

  updatedAt: string;
}

function getGradingItems(gradingList: PerSubProblemGradingType[]) {
  const gradingItemsMap: {
    [key: string]: Omit<
      GradingItem,
      'numSubProblemsAnswered' | 'numSubProblemsGraded' | 'numSubProblemsInstructorGraded'
    > & {
      subProblemsAnswered: Set<string>;
      subProblemsGraded: Set<string>;
      subProblemsInstructorGraded: Set<string>;
    };
  } = {};
  gradingList.forEach((i) => {
    const key = `${i.homeworkId}-${i.questionId}-${i.studentId}`;
    if (!gradingItemsMap[key]) {
      gradingItemsMap[key] = {
        homeworkId: i.homeworkId,
        questionId: i.questionId,
        studentId: i.studentId,
        updatedAt: i.updatedAt,
        subProblemsAnswered: new Set(),
        subProblemsGraded: new Set(),
        subProblemsInstructorGraded: new Set(),
      };
    }

    gradingItemsMap[key].subProblemsAnswered.add(i.subProblemId);
    if (i.updatedAt > gradingItemsMap[key].updatedAt) gradingItemsMap[key].updatedAt = i.updatedAt;
    if (i.reviewType) {
      gradingItemsMap[key].subProblemsGraded.add(i.subProblemId);
      if (i.reviewType === ReviewType.INSTRUCTOR) {
        gradingItemsMap[key].subProblemsInstructorGraded.add(i.subProblemId);
      }
    }
  });

  return Object.values(gradingItemsMap).map((i) => {
    const { subProblemsAnswered, subProblemsGraded, subProblemsInstructorGraded, ...rest } = i;
    return {
      ...rest,
      numSubProblemsAnswered: subProblemsAnswered?.size ?? 0,
      numSubProblemsGraded: subProblemsGraded?.size ?? 0,
      numSubProblemsInstructorGraded: subProblemsInstructorGraded?.size ?? 0,
    } as GradingItem;
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfGetOrSetError(req, res)) return;
  const courseId = req.query.courseId as string;
  if (!courseId) return res.status(422).send('Missing params.');
  const instanceId = (req.query.courseInstance as string) ?? CURRENT_TERM;

  const userId = await getUserIdIfAuthorizedOrSetError(
    req,
    res,
    ResourceName.COURSE_HOMEWORK,
    Action.INSTRUCTOR_GRADING,
    { courseId, instanceId }
  );
  if (!userId) return;

  const gradingList: PerSubProblemGradingType[] = await executeDontEndSet500OnError(
    `SELECT 
        a.homeworkId AS homeworkId,
        a.questionId AS questionId,
        a.subProblemId AS subProblemId,
        a.userId AS studentId,
        g.reviewType AS reviewType,
        MAX(a.updatedAt) AS updatedAt
    FROM Answer a LEFT JOIN Grading g ON a.id = g.answerId
    WHERE a.courseId = ? AND a.courseInstance = ?
    GROUP BY homeworkId, questionId, subProblemId, userId, reviewType 
    `,
    [courseId, instanceId],
    res
  );
  if (!gradingList) return;
  const homeworks = await getAllHomeworksOrSetError(courseId, instanceId, true, res);
  const gradingItems = getGradingItems(gradingList);
  res.status(200).json({
    homeworks,
    gradingItems,
  } as GetCourseGradingItemsResponse);
}
