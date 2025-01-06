import { NextApiRequest, NextApiResponse } from 'next';
import { checkIfGetOrSetError, executeAndEndSet500OnError } from '../comment-utils';
import { CURRENT_TERM } from '@stex-react/utils';
import { getHomeworkOrSetError } from './get-homework';
import { getGradingItems } from '../commen-homework-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkIfGetOrSetError(req, res)) return;
  const courseId = req.query.courseId as string;
  const homeworkId = Number(req.query.homeworkId);
  if (!courseId) return res.status(422).send('Missing params.');
  const instanceId = (req.query.courseInstance as string) ?? CURRENT_TERM;
  const homework = await getHomeworkOrSetError(homeworkId, true, res);
  homework.problems = JSON.parse(homework.problems.toString());
  const totalstudentAttend = await executeAndEndSet500OnError(
    `SELECT SUM(answer_count) AS total_answers From (SELECT count( DISTINCT userId) as answer_count FROM Answer WHERE questionId in (?) GROUP BY userId) AS user_answers`,
    [Object.keys(homework.problems)],
    res
  );
  const answerhistogram = [];
  const gradingStates = [];
  const gradingItems = await getGradingItems(courseId, instanceId, res);
  for (const questionId of Object.keys(homework.problems)) {
    answerhistogram.push({
      questionId,
      answer_count: (
        await executeAndEndSet500OnError(
          `select count(DISTINCT userId) as answer_count From Answer where questionId=?`,
          [questionId],
          res
        )
      )[0].answer_count,
    });
    gradingStates.push({ questionId, graded: 0, ungraded: 0, partially_graded: 0 });
    for (const gradingItem of gradingItems.filter(
      (item) => item.questionId === questionId && item.homeworkId == homeworkId
    )) {
      if (gradingItem.numSubProblemsAnswered == gradingItem.numSubProblemsInstructorGraded) {
        gradingStates.at(-1).graded++;
      } else if (gradingItem.numSubProblemsInstructorGraded == 0) {
        gradingStates.at(-1).ungraded++;
      } else {
        gradingStates.at(-1).partially_graded++;
      }
    }
  }
  const averageStudentScore = await executeAndEndSet500OnError(
    `SELECT questionId, AVG(totalPoints) AS average_score
FROM Grading as g JOIN Answer as a ON g.answerId = a.id
where a.homeworkId= ? and reviewType='INSTRUCTOR'
GROUP BY questionId`,
    [homeworkId],
    res
  );
  res.send({ totalstudentAttend, answerhistogram, gradingStates, averageStudentScore });
}
