
import { Action, CURRENT_TERM, getResourceId, ResourceName } from '@stex-react/utils';
import { NextApiRequest, NextApiResponse } from 'next';
import { getCourseEnrollmentAcl } from '../course-home/[courseId]';
import { getCacheKey } from './acl-utils/acl-common-utils';
import { returnAclIdForResourceIdAndActionId } from './acl-utils/resourceaccess-utils/resource-common-utils';

const courseIds = ['ai-1', 'ai-2', 'lbs', 'iwgs-1', 'iwgs-2'];

const instructorResourceAndAction = [
  { resource: ResourceName.COURSE_NOTES, action: Action.MUTATE },
  { resource: ResourceName.COURSE_QUIZ, action: Action.MUTATE },
  { resource: ResourceName.COURSE_STUDY_BUDDY, action: Action.MODERATE },
  { resource: ResourceName.COURSE_HOMEWORK, action: Action.MUTATE },
  { resource: ResourceName.COURSE_ACCESS, action: Action.ACCESS_CONTROL },
];


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { courseId, instanceId } = req.query;
    if (!courseId || !instanceId) {
      return res.status(400).json({ error: 'Missing courseId or instanceId in query parameters.' });
    }

    const instructorResourceIdAndAction = courseIds.flatMap((course) =>
      instructorResourceAndAction.map(({ resource, action }) => ({
        resourceId: getResourceId(resource, {
          courseId: course,
          instanceId: CURRENT_TERM,
        }),
        action,
      }))
    );

    const aclId = getCourseEnrollmentAcl(courseId as string, instanceId as string);
    const enrolledPersons = await CACHE_STORE.getFromSet(getCacheKey(aclId));

    const INSTRUCTOR_ACLS = Array.from(
      new Set(
        await Promise.all(
          instructorResourceIdAndAction.map(async ({ resourceId, action }) => {
            const aclId = await returnAclIdForResourceIdAndActionId(resourceId, action);
            return aclId;
          })
        )
      )
    );

    const instructors = (
      await Promise.all(
        INSTRUCTOR_ACLS.map(async (aclId) => {
          const result = await CACHE_STORE.getFromSet(getCacheKey(aclId));
          return result || [];
        })
      )
    ).flat();

    const uniqueInstructors = new Set(instructors);
    const enrolledStudents = enrolledPersons.filter((person) => !uniqueInstructors.has(person));
    return res.status(200).json(enrolledStudents);
  } catch (error) {
    console.error('Error fetching enrolled students:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

