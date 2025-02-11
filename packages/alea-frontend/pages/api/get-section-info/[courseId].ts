import {
  ClipInfo,
  SectionInfo,
  SectionsAPIData,
  getCourseInfo,
  getDocumentSections,
} from '@stex-react/api';
import { CoverageSnap } from '@stex-react/utils';
import { convert } from 'html-to-text';
import { NextApiRequest, NextApiResponse } from 'next';
import { getCoverageData } from '../get-coverage-timeline';
import { readdir, readFile } from 'fs/promises';
import { getSlideCounts } from '../get-slide-counts/[courseId]';
const CACHE_EXPIRY_TIME = 60 * 60 * 1000;
export const CACHED_VIDEO_SLIDESMAP: Record<string, any> = {};
let CACHE_REFRESH_TIME: number | undefined = undefined;
let CACHE_PROMISE: Promise<void> | null = null;

export async function populateVideoToSlidesMap() {
  const dirPath = process.env.VIDEO_TO_SLIDES_MAP_DIR;
  if (!dirPath) return;
  const files = await readdir(dirPath);
  for (const file of files) {
    if (file.endsWith('_extracted_content.json')) {
      const courseId = file.replace('_extracted_content.json', '');
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

function getAllSections(data: SectionsAPIData, level = 0): SectionInfo | SectionInfo[] {
  if (data.title?.length) {
    const title = convert(data.title);
    const children: SectionInfo[] = [];
    for (const c of data.children || []) {
      const subNodes = getAllSections(c, level + 1);
      if (subNodes instanceof Array) children.push(...subNodes);
      else children.push(subNodes);
    }
    return { id: data.id, title, level, children } as SectionInfo;
  }
  const sections: SectionInfo[] = [];
  for (const c of data.children || []) {
    const subNodes = getAllSections(c, level);
    if (subNodes instanceof Array) sections.push(...subNodes);
    else sections.push(subNodes);
  }
  return sections;
}

function getSectionsInOrder(nodes: SectionInfo[]): SectionInfo[] {
  const nodeList = [] as SectionInfo[];
  for (const n of nodes) {
    nodeList.push(n);
    nodeList.push(...getSectionsInOrder(n.children));
  }
  return nodeList;
}

export function addVideoInfo(sections: SectionInfo[], snaps: CoverageSnap[]) {
  const inOrderList = getSectionsInOrder(sections);
  let snapIdx = 0;
  for (const section of inOrderList) {
    section.clipId = snaps[snapIdx].clipId;
    section.timestamp_ms = snaps[snapIdx].timestamp_ms;
    if (section.title === snaps[snapIdx].sectionName) snapIdx++;
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
  const courses = await getCourseInfo(process.env.NEXT_PUBLIC_MMT_URL);
  if (!courseId || !courses[courseId]) {
    res.status(404).send(`Course not found [${courseId}]`);
    return;
  }
  const { notesArchive, notesFilepath } = courses[courseId];
  const docSections = await getDocumentSections(
    process.env.NEXT_PUBLIC_MMT_URL,
    notesArchive,
    notesFilepath
  );
  const allSections = getAllSections(docSections) as SectionInfo[];
  const coverageData = getCoverageData()[courseId].filter(snap=>snap.sectionName);
  if (coverageData?.length) addVideoInfo(allSections, coverageData);
  const videoSlides = await getVideoToSlidesMap(courseId);
  const slideCounts = await getSlideCounts(courseId, res);
  if (videoSlides && Object.keys(videoSlides).length > 0) {
    addClipInfo(allSections, slideCounts, videoSlides);
  }
  res.status(200).send(allSections);
}
