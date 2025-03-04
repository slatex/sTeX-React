import {
  SectionInfo,
  SectionsAPIData,
  SlideClipInfo,
  getCourseInfo,
  getDocumentSections,
} from '@stex-react/api';
import { CoverageSnap } from '@stex-react/utils';
import { convert } from 'html-to-text';
import { NextApiRequest, NextApiResponse } from 'next';
import { getCoverageData } from '../get-coverage-timeline';
import { readdir, readFile } from 'fs/promises';
const CACHE_EXPIRY_TIME = 60 * 60 * 1000;
const videoToSlidesMap: Record<string, any> = {};
let cacheRefreshTime: number | undefined = undefined;
let cachePromise: Promise<void> | null = null;

async function populateVideoToSlidesMap() {
  const dirPath = process.env.VIDEO_TO_SLIDES_MAP_DIR;
  if (!dirPath) return;
  const files = await readdir(dirPath);
  for (const file of files) {
    if (file.endsWith('_processed_slides.json')) {
      const courseId = file.replace('_processed_slides.json', '');
      const filePath = `${dirPath}/${file}`;
      const fileData = await readFile(filePath, 'utf-8');
      const data = JSON.parse(fileData);
      videoToSlidesMap[courseId] = data;
    }
  }
  cacheRefreshTime = Date.now();
}

async function refreshCache() {
  if (!cachePromise) {
    cachePromise = new Promise<void>((resolve) => {
      (async () => {
        await populateVideoToSlidesMap();
        resolve();
      })();
    }).finally(() => {
      cachePromise = null;
    });
  }
  await cachePromise;
}

async function getVideoToSlidesMap(courseId: string) {
  const isCacheExpired = !cacheRefreshTime || Date.now() > cacheRefreshTime + CACHE_EXPIRY_TIME;
  if (isCacheExpired && !cachePromise) {
    refreshCache();
  }
  return videoToSlidesMap[courseId];
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

function addClipInfo(allSections: SectionInfo[], jsonData: any[]) {
  const clipDataMap: {
    [sectionId: string]: SlideClipInfo[];
  } = {};
  jsonData.forEach((entry) => {
    const { sectionId, start_time, end_time, video_id } = entry;
    if (!clipDataMap[sectionId]) {
      clipDataMap[sectionId] = [];
    }
    if (start_time !== undefined && end_time !== undefined) {
      clipDataMap[sectionId].push({
        clipId: video_id,
        startTimeSec: start_time,
        endTimeSec: end_time,
      });
    }
  });
  function processSections(sections: SectionInfo[]) {
    sections.forEach((section) => {
      if (clipDataMap[section.id]) {
        section.clipInfo = clipDataMap[section.id];
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
  //Todo alea-4
  // const { notesArchive, notesFilepath } = courses[courseId];
  // const docSections = await getDocumentSections(
  //   process.env.NEXT_PUBLIC_MMT_URL,
  //   notesArchive,
  //   notesFilepath
  // );
  // const allSections = getAllSections(docSections) as SectionInfo[];
  // const coverageData = getCoverageData()[courseId].filter(snap=>snap.sectionName);
  // if (coverageData?.length) addVideoInfo(allSections, coverageData);
  // const videoSlides = await getVideoToSlidesMap(courseId);
  // if (videoSlides) {
  //   addClipInfo(allSections, videoSlides);
  // }
  // res.status(200).send(allSections);
  res.status(200).send("we will use contentToc")
}
