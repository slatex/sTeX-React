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
import { readdirSync, readFileSync, statSync } from 'fs';
import path from 'path';

const CACHE_EXPIRY_TIME = 60 * 60 * 1000;
const FILE_AVAILABILITY_LIST_EXPIRY_TIME = 60 * 60 * 1000;

const videoToSlidesMap: Record<string, { data: any; lastUpdated: number }> = {};
const FILE_AVAILABILITY_LIST: Record<string, { lastUpdated: number }> = {};
function getCourseIdFromFile(filePath: string): string {
  return filePath.split('/').pop()?.split('_')[0] || '';
}
function isVideoToSlidesMapCached(courseId: string): boolean {
  const cachedData = videoToSlidesMap[courseId];
  return cachedData && Date.now() - cachedData.lastUpdated < CACHE_EXPIRY_TIME;
}

export function getAllFilesInDirectory(directoryPath: string): string[] {
  const files = readdirSync(directoryPath);
  if (!files) return [];
  return files.filter((file) => {
    const fullPath = path.join(directoryPath, file);
    return !statSync(fullPath).isDirectory();
  });
}

function updateAvailableFiles() {
  const allFiles = getAllFilesInDirectory(process.env.VIDEO_TO_SLIDES_MAP_DIR);
  allFiles.forEach((file) => {
    const courseId = getCourseIdFromFile(file);
    FILE_AVAILABILITY_LIST[courseId] = { lastUpdated: Date.now() };
  });
}

function isFileAvailable(courseId: string): boolean {
  const courseData = FILE_AVAILABILITY_LIST[courseId];
  if (!courseData || Date.now() - courseData.lastUpdated >= FILE_AVAILABILITY_LIST_EXPIRY_TIME) {
    updateAvailableFiles();
    return false;
  }

  return true;
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
  const coverageData = getCoverageData()[courseId];
  if (coverageData?.length) addVideoInfo(allSections, coverageData);

  if (!isVideoToSlidesMapCached(courseId)) {
    const filePath = `${process.env.VIDEO_TO_SLIDES_MAP_DIR}/${courseId}_processed_slides.json`;
    if (isFileAvailable(courseId)) {
      videoToSlidesMap[courseId] = {
        data: JSON.parse(readFileSync(filePath, 'utf-8')),
        lastUpdated: Date.now(),
      };
    }
  }
  if (videoToSlidesMap[courseId]) {
    addClipInfo(allSections, videoToSlidesMap[courseId]?.data);
  }
  res.status(200).send(allSections);
}
