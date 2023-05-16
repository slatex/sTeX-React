import {
  SectionInfo,
  SectionsAPIData,
  getDocumentSections,
} from '@stex-react/api';
import {
  COURSES_INFO,
  CoverageSnap
} from '@stex-react/utils';
import { convert } from 'html-to-text';
import { NextApiRequest, NextApiResponse } from 'next';
import { getCoverageData } from '../get-coverage-timeline';

function getAllSections(
  data: SectionsAPIData,
  level = 0
): SectionInfo | SectionInfo[] {
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const courseId = req.query.courseId as string;
  if (!courseId || !COURSES_INFO[courseId]) {
    res.status(404).send(`Course not found [${courseId}]`);
    return;
  }
  const { notesArchive, notesFilepath } = COURSES_INFO[courseId];
  const docSections = await getDocumentSections(
    process.env.NEXT_PUBLIC_MMT_URL,
    notesArchive,
    notesFilepath
  );
  const allSections = getAllSections(docSections) as SectionInfo[];
  const coverageData = getCoverageData()[courseId];
  if (coverageData?.length) addVideoInfo(allSections, coverageData);
  res.status(200).send(allSections);
}
