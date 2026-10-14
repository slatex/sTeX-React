import {
  Action,
  ALL_RESOURCE_TYPES,
  COURSE_SPECIFIC_RESOURCENAMES,
  CourseResourceAction,
  getCurrentTermForUniversity,
  getUpcomingTermForUniversity,
  ResourceName,
} from '@alea/utils';
import { NextApiRequest, NextApiResponse } from 'next';
import { isUserIdAuthorizedForAny } from './access-control/resource-utils';
import { getUserIdOrSetError } from './comment-utils';
import { getCourseInfoMetadataFromDb } from './course-metadata/get-course-info-metadata';
import { getAllCoursesFromDb } from './get-all-courses';

type StoredInstructor = string | { id?: string; name?: string };

function getValidActionsForResource(resourceName: ResourceName): Action[] {
  const resource = ALL_RESOURCE_TYPES.find((resource) => resource.name === resourceName);
  if (!resource) {
    throw new Error(`Resource ${resourceName} not found`);
  }
  return resource.possibleActions;
}

function hasNamedInstructor(userId: string, instructors: StoredInstructor[] | undefined) {
  const normalizedUserId = userId.trim().toLowerCase();
  if (!normalizedUserId || !Array.isArray(instructors)) return false;

  return instructors.some((instructor) => {
    const instructorId =
      typeof instructor === 'string' ? instructor : instructor.id ?? instructor.name;
    return (instructorId ?? '').trim().toLowerCase() === normalizedUserId;
  });
}

export async function isUserNamedInstructorForCourse(
  userId: string,
  courseId: string,
  instanceId: string
) {
  const metadata = await getCourseInfoMetadataFromDb(courseId, instanceId);
  return hasNamedInstructor(userId, metadata?.instructors);
}

export async function filterNamedInstructorResources<
  T extends { courseId: string; instanceId: string }
>(userId: string, resources: T[]): Promise<T[]> {
  const namedInstructorChecks = new Map<string, Promise<boolean>>();

  const isNamedInstructorForCourse = (courseId: string, instanceId: string) => {
    const cacheKey = `${courseId}:${instanceId}`;
    const cachedCheck = namedInstructorChecks.get(cacheKey);
    if (cachedCheck) return cachedCheck;

    const check = isUserNamedInstructorForCourse(userId, courseId, instanceId);
    namedInstructorChecks.set(cacheKey, check);
    return check;
  };

  const filteredResources: T[] = [];
  for (const resource of resources) {
    if (await isNamedInstructorForCourse(resource.courseId, resource.instanceId)) {
      filteredResources.push(resource);
    }
  }
  return filteredResources;
}

export async function getAuthorizedCourseResources(userId: string, includeUpcomingTerm = false) {
  const courses = await getAllCoursesFromDb();
  const resourceNames = COURSE_SPECIFIC_RESOURCENAMES;

  const resourceActions: CourseResourceAction[] = [];

  for (const [courseId, course] of Object.entries(courses)) {
    const universityId = course.universityId ?? 'FAU';
    const terms = [
      getCurrentTermForUniversity(universityId),
      includeUpcomingTerm ? getUpcomingTermForUniversity(universityId) : undefined,
    ].filter((term): term is string => !!term && term !== 'null');

    const uniqueTerms = [...new Set(terms)];
    for (const instanceId of uniqueTerms) {
      for (const name of resourceNames) {
        resourceActions.push({
          courseId,
          instanceId,
          name,
          actions: getValidActionsForResource(name),
        });
      }
    }
  }

  const validResourceActions = (
    await Promise.all(
      resourceActions.map(async ({ name, courseId, instanceId, actions }) => {
        const validActions: Action[] = [];

        for (const action of actions) {
          const isAuthorized = await isUserIdAuthorizedForAny(userId, [
            { name, action, variables: { courseId, instanceId } },
          ]);

          if (isAuthorized) validActions.push(action);
        }
        return validActions.length ? { name, courseId, instanceId, actions: validActions } : null;
      })
    )
  ).filter((resource): resource is CourseResourceAction => resource !== null);
  return validResourceActions;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = await getUserIdOrSetError(req, res);
  if (!userId) return;
  const authorizedResourceActions = await getAuthorizedCourseResources(userId, true);
  const instructorHomeResources = await filterNamedInstructorResources(
    userId,
    authorizedResourceActions
  );

  return res.status(200).json(instructorHomeResources);
}
