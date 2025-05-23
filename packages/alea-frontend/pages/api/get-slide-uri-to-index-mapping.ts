import { getCourseInfo } from '@stex-react/api';
import { NextApiRequest, NextApiResponse } from 'next';
import { CACHED_SLIDES, getSlidesForCourse,  } from './get-slides';

export async function getSlideUriToIndexMapping(courseId: string, res: NextApiResponse) {
  const courses = await getCourseInfo();
  const courseInfo = courses[courseId];
  if (!courseInfo) {
    res.status(404).json({ error: 'Course not found!' });
    return;
  }

  if (!CACHED_SLIDES[courseId]) {
    CACHED_SLIDES[courseId] = await getSlidesForCourse(courseInfo.notes);
  }

  const uriToIndexMap: { [sectionId: string]: { [slideUri: string]: number } } = {};

  for (const [sectionId, slides] of Object.entries(CACHED_SLIDES[courseId])) {
    const sectionMap: { [slideUri: string]: number } = {};
    slides.forEach((slide, index) => {
      if (slide.slide?.uri) {
        sectionMap[slide.slide?.uri] = index;
      }
    });
    uriToIndexMap[sectionId] = sectionMap;
  }

  return uriToIndexMap;
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const courseId = req.query.courseId as string;
  const slidesMap = await getSlideUriToIndexMapping(courseId, res);
  if (slidesMap) {
    return res.status(200).json(slidesMap);
  }
}
