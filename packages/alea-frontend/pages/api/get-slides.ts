import {
  Slide,
  SlideElement,
  SlideType,
  TOCElem,
  getCourseInfo,
  getDocumentSections,
  getSectionSlides,
} from '@stex-react/api';
import { NextApiRequest, NextApiResponse } from 'next';

async function recursivelyExpandSlideElementsExcludeSections(
  slideElems: SlideElement[],
  sectionId: string
): Promise<Slide[]> {
  const elems: (Extract<SlideElement, { type: 'Paragraph' | 'Slide' }> | Slide)[] = [];
  for (const slideElem of slideElems) {
    if (slideElem.type === 'Inputref') {
      const slidesData = await getSectionSlides(slideElem.uri);
      if (slidesData?.length > 0) {
        const [css, slideElems] = slidesData;
        elems.push(...(await recursivelyExpandSlideElementsExcludeSections(slideElems, sectionId)));
      }
    } else if (slideElem.type === 'Paragraph' || slideElem.type === 'Slide') {
      elems.push(slideElem);
    } else if (slideElem.type === 'Section') {
      continue; // Skip sub-sections
    }
  }

  if (elems.length === 0) return [];

  if (elems.every((e) => 'type' in e && e.type === 'Paragraph')) {
    return [
      {
        slideType: SlideType.TEXT,
        paragraphs: elems,
        preNotes: [],
        postNotes: [],
        sectionId,
      },
    ];
  }

  const finalSlides: Slide[] = [];
  let inWaitParas: Extract<SlideElement, { type: 'Paragraph' }>[] = [];
  for (const elem of elems) {
    const lastSlide = finalSlides.length > 0 ? finalSlides[finalSlides.length - 1] : undefined;
    if ('slideType' in elem) {
      finalSlides.push(elem);
    } else if (elem.type === 'Slide') {
      const newSlide = {
        slideType: SlideType.FRAME,
        slide: elem,
        preNotes: [],
        postNotes: [],
        sectionId,
      } as Slide;
      if (inWaitParas.length > 0) {
        newSlide.preNotes.push(...inWaitParas);
        inWaitParas = [];
      }
      finalSlides.push(newSlide);
    } else if (lastSlide?.slideType === SlideType.FRAME) {
      lastSlide.postNotes.push(elem);
    } else if (lastSlide?.slideType === SlideType.TEXT) {
      lastSlide.paragraphs.push(elem);
    } else {
      inWaitParas.push(elem);
    }
  }
  if (inWaitParas.length > 0) {
    finalSlides.push({
      slideType: SlideType.TEXT,
      paragraphs: inWaitParas,
      preNotes: [],
      postNotes: [],
      sectionId,
    });
  }
  return finalSlides;
}

async function getSlidesFromToc(elems: TOCElem[], bySection: Record<string, Slide[]>) {
  for (const elem of elems) {
    if (elem.type === 'Section') {
      const secId = elem.id;
      const slideData = await getSectionSlides(elem.uri);
      if (slideData) {
        const [css, slideElems] = slideData;
        bySection[secId] = await recursivelyExpandSlideElementsExcludeSections(slideElems, secId);
      }
    }
    if ('children' in elem) {
      await getSlidesFromToc(elem.children, bySection);
    }
  }
}

export async function getSlidesForCourse(notesUri: string) {
  const toc = (await getDocumentSections(notesUri))[1];
  const bySection: { [sectionId: string]: Slide[] } = {};
  await getSlidesFromToc(toc, bySection);
  return bySection;
}

// Use global cache to persist between requests in dev/local
const globalCache = global as any;
if (!globalCache.G_CACHED_SLIDES) {
  globalCache.G_CACHED_SLIDES = {};
}
export const CACHED_SLIDES: {
  [courseId: string]: { [sectionId: string]: Slide[] };
} = globalCache.G_CACHED_SLIDES;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const courseId = req.query.courseId as string;
  const sectionIds = req.query.sectionIds as string;
  if (!courseId || !sectionIds) {
    res.status(400).send('Course ID and section IDs are required!');
    return;
  }
  const courses = await getCourseInfo();
  const courseInfo = courses[courseId];
  if (!courseInfo) {
    res.status(404).json({ error: 'Course not found!' });
    return;
  }
  const sectionIdArr = sectionIds.split(',');
  if (!CACHED_SLIDES[courseId]) {
    CACHED_SLIDES[courseId] = await getSlidesForCourse(courseInfo.notes);
  }
  const data: { [sectionId: string]: Slide[] } = {};
  for (const secId of sectionIdArr) {
    data[secId] = CACHED_SLIDES[courseId][secId];
  }

  return res.status(200).json(data);
}
