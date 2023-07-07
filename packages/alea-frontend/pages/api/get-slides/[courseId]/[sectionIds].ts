import { Slide, SlideType, getCourseInfo } from '@stex-react/api';
import {
  FileLocation,
  XhtmlContentUrl,
  getSectionInfo,
} from '@stex-react/utils';
import { getOuterHTML, textContent } from 'domutils';
import * as htmlparser2 from 'htmlparser2';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  fetchDocumentCached,
  preFetchDescendentsOfDoc,
} from '../../prefetchHelper';

function FrameSlide(
  slideContent: any,
  nodeId: FileLocation,
  sectionId: string
): Slide {
  return {
    slideContent: getOuterHTML(slideContent),
    slideType: SlideType.FRAME,
    autoExpand: false,
    preNotes: [],
    postNotes: [],
    archive: nodeId.archive,
    filepath: nodeId.filepath,
    sectionId,
  };
}

function TextSlide(
  slideContent: any,
  nodeId: FileLocation,
  titleElement: any,
  sectionId: string
): Slide {
  let autoExpand = false;
  if (titleElement) {
    const titleText = textContent(titleElement);
    autoExpand = !titleText.trim().length || titleText.startsWith('http');
  }
  return {
    slideContent: getOuterHTML(slideContent),
    slideType: SlideType.TEXT,
    autoExpand,
    preNotes: [],
    postNotes: [],
    archive: nodeId.archive,
    filepath: nodeId.filepath,
    sectionId,
  };
}

async function getSlidesForDocNode(
  loc: FileLocation,
  node: any,
  isDoc: boolean,
  currentSectionId: string,
  titleElement?: any
): Promise<Slide[]> {
  const slides = [];

  if (!isDoc) {
    const className = node.attribs?.['class'];
    if (className?.includes('frame')) {
      return [FrameSlide(node, loc, currentSectionId)];
    }

    const embedUrl = node.attribs['data-inputref-url'];
    const mmtNodeId = node.attribs?.['id']; //node.attribs?.['id']);
    if (mmtNodeId) currentSectionId = mmtNodeId;
    if (embedUrl) {
      const { archive, filepath } = getSectionInfo(embedUrl);
      const nodeId = { archive, filepath };
      // console.log(`Found: ${nodeId.filepath}`);
      const ret = await getSlidesForDoc(nodeId, currentSectionId, node);
      return ret;
    }
  }
  const children = node.childNodes || [];
  const preNotes: string[] = [];
  // console.log(children.length);
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    // if (!(child instanceof Element)) {
    if (!child.attribs && !child.children) {
      // console.log(i);
      // console.log(child);
      continue;
    }
    const subSlides = await getSlidesForDocNode(
      loc,
      child,
      false,
      currentSectionId
    );

    if (subSlides.length > 0) {
      subSlides[0].preNotes = [...preNotes, ...subSlides[0].preNotes];
      preNotes.length = 0;
    } else {
      preNotes.push(getOuterHTML(child));
    }

    slides.push(...subSlides);
  }
  if (preNotes.length > 0 && slides.length > 0) {
    slides[slides.length - 1].postNotes.push(...preNotes);
  }
  const numFrameOrExpandableSlides = slides.filter(
    (s) => s.slideType === SlideType.FRAME || !s.autoExpand
  ).length;
  if (isDoc && numFrameOrExpandableSlides === 0) {
    // TODO: search for body, instead of relying it being the first child.
    const body = (node as any).childNodes[0];
    if (body) {
      if (body.tagName?.toLowerCase() === 'body') {
        body.tagName = 'div';
      }

      body.attribs['style'] = 'display: block;'; // was width:921.4425px
      body.attribs['class'] = 'text-frame';
      return [TextSlide(body, loc, titleElement, currentSectionId)];
    }
  }
  return slides;
}

async function getSlidesForDoc(
  loc: FileLocation,
  currentSectionId: string,
  titleElement?: Element
) {
  const url = XhtmlContentUrl(loc.archive, loc.filepath);
  const data = fetchDocumentCached(url);
  const htmlDoc = htmlparser2.parseDocument(data);
  return await getSlidesForDocNode(
    loc,
    htmlDoc,
    true,
    currentSectionId,
    titleElement
  );
}

export async function getSlides({ archive, filepath }: FileLocation) {
  await preFetchDescendentsOfDoc(
    process.env.NEXT_PUBLIC_MMT_URL,
    XhtmlContentUrl(archive, filepath)
  );
  const allSlides = await getSlidesForDoc({ archive, filepath }, undefined);
  const bySection: { [sectionId: string]: Slide[] } = {};
  for (const slide of allSlides) {
    const secId = slide.sectionId;
    if (!bySection[secId]) bySection[secId] = [];
    bySection[slide.sectionId].push(slide);
  }
  /*for (const secId of Object.keys(bySection)) {
    console.log(`${secId}: ${bySection[secId].length}`);
  }*/
  return bySection;
}

export const CACHED_SLIDES: {
  [courseId: string]: { [sectionId: string]: Slide[] };
} = {};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const courseId = req.query.courseId as string;
  const sectionIds = req.query.sectionIds as string;
  const courses = await getCourseInfo(process.env.NEXT_PUBLIC_MMT_URL);
  const courseInfo = courses[courseId];
  if (!courseInfo) {
    res.status(404).json({ error: 'Course not found!' });
    return;
  }
  const sectionIdArr = sectionIds.split(',');
  if (!CACHED_SLIDES[courseId]) {
    CACHED_SLIDES[courseId] = await getSlides({
      archive: courseInfo.notesArchive,
      filepath: courseInfo.notesFilepath,
    });
  }
  const data: { [sectionId: string]: Slide[] } = {};
  for (const secId of sectionIdArr) {
    data[secId] = CACHED_SLIDES[courseId][secId];
  }

  return res.status(200).json(data);
}
