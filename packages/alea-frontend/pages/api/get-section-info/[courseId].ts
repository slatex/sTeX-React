import {
  ClipInfo,
  getCourseInfo,
  getDocumentSections,
  SectionInfo,
  TOCElem,
} from '@stex-react/api';
import { CoverageSnap } from '@stex-react/utils';
import { readdir, readFile } from 'fs/promises';
import { convert } from 'html-to-text';
import { NextApiRequest, NextApiResponse } from 'next';
import { getCoverageData } from '../get-coverage-timeline';

const CACHE_EXPIRY_TIME = 60 * 60 * 1000;
export const CACHED_VIDEO_SLIDESMAP: Record<string, any> = {};
let CACHE_REFRESH_TIME: number | undefined = undefined;
let CACHE_PROMISE: Promise<void> | null = null;

export async function populateVideoToSlidesMap() {
  const dirPath = process.env.VIDEO_TO_SLIDES_MAP_DIR;
  if (!dirPath) return;
  const files = await readdir(dirPath);
  for (const file of files) {
    if (file.endsWith('_updated_extracted_content.json')) {
      const courseId = file.replace('_updated_extracted_content.json', '');
      const filePath = `${dirPath}/${file}`;
      const fileData = await readFile(filePath, 'utf-8');
      const data = JSON.parse(fileData);
      CACHED_VIDEO_SLIDESMAP[courseId] = data;
    }
  }
  CACHE_REFRESH_TIME = Date.now();
}

async function refreshCache() {
  if (!CACHE_PROMISE) {
    CACHE_PROMISE = new Promise<void>((resolve) => {
      (async () => {
        await populateVideoToSlidesMap();
        resolve();
      })();
    }).finally(() => {
      CACHE_PROMISE = null;
    });
  }
  await CACHE_PROMISE;
}

async function getVideoToSlidesMap(courseId: string) {
  const isCacheExpired = !CACHE_REFRESH_TIME || Date.now() > CACHE_REFRESH_TIME + CACHE_EXPIRY_TIME;
  if (isCacheExpired && !CACHE_PROMISE) {
    if (!CACHED_VIDEO_SLIDESMAP[courseId]) {
      await refreshCache();
    } else refreshCache();
  }
  return CACHED_VIDEO_SLIDESMAP[courseId];
}

function getAllSections(data: TOCElem, level = 0): SectionInfo | SectionInfo[] | undefined {
  const { type } = data;
  if (type === 'Paragraph' || type === 'Slide') return undefined;
  if (type === 'Section') {
    const secInfo: SectionInfo = {
      id: data.id,
      uri: data.uri,
      level,
      title: convert(data.title),
      children: [],
    };

    const children: SectionInfo[] = [];
    for (const c of data.children) {
      const subNodes = getAllSections(c, level + 1);
      if (!subNodes) continue;
      if (Array.isArray(subNodes)) children.push(...subNodes);
      else children.push(subNodes);
    }
    secInfo.children = children;
    return secInfo;
  } else {
    const children: SectionInfo[] = [];
    for (const c of data.children ?? []) {
      const subNodes = getAllSections(c, level);
      if (!subNodes) continue;
      if (Array.isArray(subNodes)) children.push(...subNodes);
      else children.push(subNodes);
    }
    return children.length > 0 ? children : undefined;
  }
}

function getSectionsInOrder(nodes: SectionInfo[]): SectionInfo[] {
  const nodeList = [] as SectionInfo[];
  for (const n of nodes) {
    nodeList.push(n);
    nodeList.push(...getSectionsInOrder(n.children));
  }
  return nodeList;
}

export function addCoverageInfo(sections: SectionInfo[], snaps: CoverageSnap[]) {
  const inOrderList = getSectionsInOrder(sections);
  let snapIdx = 0;
  for (const section of inOrderList) {
    section.clipId = snaps[snapIdx].clipId;
    section.timestamp_ms = snaps[snapIdx].timestamp_ms;
    if (section.uri === snaps[snapIdx].sectionUri) snapIdx++;
    if (snapIdx >= snaps.length) break;
  }
  return;
}

function addClipInfo(
  allSections: SectionInfo[],
  slideCounts: { [key: string]: number },
  jsonData: any
) {
  const clipDataMap: { [sectionId: string]: { [slideIndex: number]: ClipInfo[] } } = {};

  Object.entries(jsonData).forEach(
    ([videoId, videoData]: [string, { extracted_content: { [timeStamp: number]: ClipInfo } }]) => {
      const extractedContent: { [timeStamp: number]: ClipInfo } = videoData.extracted_content;
      if (!extractedContent) return;
      Object.entries(extractedContent).forEach(([timeStamp, clipData]) => {
        const { sectionId, slideIndex } = clipData;
        if (!sectionId || slideIndex === null) return;
        if (!clipDataMap[sectionId]) {
          const totalSlides = slideCounts[sectionId] || 0;
          clipDataMap[sectionId] = {};
          for (let i = 1; i <= totalSlides; i++) {
            clipDataMap[sectionId][i] = [];
          }
        }
        if (!clipDataMap[sectionId][slideIndex]) {
          clipDataMap[sectionId][slideIndex] = [];
        }

        clipDataMap[sectionId][slideIndex].push({
          video_id: videoId,
          start_time: clipData.start_time,
          end_time: clipData.end_time,
          //donot remove ocr_slide_content and slideContent
          // (kept it for debugging purpose when needed)
          // ocr_slide_content: clipData.ocr_slide_content,
          title: clipData.title,
          thumbnail: clipData.thumbnail,
          // slideContent: clipData.slideContent,
        });
      });
    }
  );
  function processSections(sections: SectionInfo[]) {
    sections.forEach((section) => {
      if (clipDataMap[section.id]) {
        section.clipInfo = clipDataMap[section.id];
      } else {
        section.clipInfo = {};
        for (let i = 1; i <= (slideCounts[section.id] || 0); i++) {
          section.clipInfo[i] = [];
        }
      }

      if (section.children && section.children.length > 0) {
        processSections(section.children);
      }
    });
  }
  processSections(allSections);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const courseId = req.query.courseId as string;
  const courses = await getCourseInfo();
  if (!courseId || !courses[courseId]) {
    res.status(404).send(`Course not found [${courseId}]`);
    return;
  }
  const { notes } = courses[courseId];

  const tocContent = (await getDocumentSections(notes))[1];

  const allSections: SectionInfo[] = [];
  for (const elem of tocContent) {
    const elemSections = getAllSections(elem);
    if (Array.isArray(elemSections)) allSections.push(...elemSections);
    else if (elemSections) allSections.push(elemSections);
  }
  const coverageData = (getCoverageData()[courseId] ?? []).filter((snap) => snap.sectionUri);
  if (coverageData?.length) addCoverageInfo(allSections, coverageData);
  // TODO ALEA4-S5
  // const videoSlides = await getVideoToSlidesMap(courseId);
  // const slideCounts = await getSlideCounts(courseId, res);
  // if (videoSlides && Object.keys(videoSlides).length > 0) {
  //   addClipInfo(allSections, slideCounts, videoSlides);
  // }
  res.status(200).send(allSections);
}
