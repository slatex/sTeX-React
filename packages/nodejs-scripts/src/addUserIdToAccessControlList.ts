import { getAllQuizzes } from '@stex-react/node-utils';
import { CURRENT_TERM } from '@stex-react/utils';
import mysql from 'serverless-mysql';

const COURSE_ID = 'ai-1';
const COURESE_ENROLLMENT_ACL = `${COURSE_ID}-${CURRENT_TERM}-enrollments`;

interface GradingEntry {
  userId: string;
}

interface AccessControlListRow {
  memberUserId: string;
}

const db = mysql({
  config: {
    host: process.env.MYSQL_HOST as string,
    port: +(process.env.MYSQL_PORT || 3306),
    database: process.env.MYSQL_COMMENTS_DATABASE as string,
    user: process.env.MYSQL_USER as string,
    password: process.env.MYSQL_PASSWORD as string,
  },
});

const gradingdb = mysql({
  config: {
    host: process.env.MYSQL_HOST,
    port: +process.env.MYSQL_PORT,
    database: process.env.MYSQL_GRADING_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
  },
});

export async function addUserIdToAccessControlList(): Promise<void> {
  if (!process.env.MYSQL_HOST) {
    console.error(`Environment variables not set. Exiting.`);
    process.exit(1);
  }

  try {
    // Fetching quizzes for a particular course
    const quizzes: any[] = getAllQuizzes().filter(
      (quiz) => quiz.courseId === COURSE_ID && quiz.courseTerm === CURRENT_TERM
    );

    const quizIds = quizzes.map((q) => q.id);
    
    // Fetch user IDs from grading table
    const userIdsFromGradingTable = await gradingdb.query<GradingEntry[]>(
      `SELECT userId
         FROM grading
         WHERE (quizId, userId, problemId, browserTimestamp_ms) IN (
             SELECT quizId, userId, problemId, MAX(browserTimestamp_ms) AS browserTimestamp_ms
             FROM grading
             WHERE quizId IN (?)
             GROUP BY quizId, userId, problemId
         )
         GROUP BY userId`,
      [quizIds] 
    );
    const gradingTableUserIds = userIdsFromGradingTable.map((row) => row.userId);
    console.log('gradingTableUserIds---', gradingTableUserIds);

    // Fetch user IDs from answer table
    const userIdsFromAnswerTable = await db.query<GradingEntry[]>(
      'SELECT DISTINCT userId FROM answer WHERE courseId = ?',
      [COURSE_ID]
    );

    const answerTableUserIds = userIdsFromAnswerTable.map((row) => row.userId);
    console.log('answerTableUserIds---', answerTableUserIds);

    if (answerTableUserIds.length === 0 && gradingTableUserIds.length === 0) {
      console.log('No user IDs found in answer or grading tables.');
      return;
    }

    // Merge and deduplicate user IDs from both sources
    const allUserIds = [...new Set([...answerTableUserIds, ...gradingTableUserIds])];
    console.log(`Combined user IDs: ${allUserIds.join(', ')}`);

    // Fetch existing user IDs in aclmembership
    const existingUserIdsInAclMembership = await db.query<AccessControlListRow[]>(
      'SELECT DISTINCT memberUserId FROM aclmembership WHERE parentACLId = ? AND memberUserId IN (?)',
      [COURESE_ENROLLMENT_ACL, allUserIds]
    );

    const existingUserIds = new Set(existingUserIdsInAclMembership.map((row) => row.memberUserId));

    // Find new user IDs to add to aclmembership
    const newUserIds = allUserIds.filter((userId) => !existingUserIds.has(userId));

    if (newUserIds.length === 0) {
      console.log('All user IDs from grading and answer tables already exist in aclmembership.');
      return;
    }

    console.log(`New user IDs to be added to aclmembership: ${newUserIds.join(', ')}`);

    // Insert new user IDs into aclmembership
    const insertValues = newUserIds.map((userId) => [COURESE_ENROLLMENT_ACL, userId]);
    await db.query('INSERT INTO aclmembership (parentACLId, memberUserId) VALUES ?', [
      insertValues,
    ]);

    console.log('User IDs successfully added to aclmembership.');
  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    await db.end();
    await gradingdb.end();
  }
}
