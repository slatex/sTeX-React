import { Box, IconButton } from '@mui/material';
import { SectionsAPIData } from '@stex-react/api';
import { MdViewer } from '@stex-react/markdown';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';
import {
  COURSES_INFO,
  CoverageTimeline,
  convertHtmlStringToPlain,
} from '@stex-react/utils';
import axios from 'axios';
import dayjs from 'dayjs';
import { useContext, useEffect, useState } from 'react';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';

interface Section {
  id: string;
  title: string;
  level: number;
  children: Section[];
}
function getAllSections(data: SectionsAPIData, level = 1): Section | Section[] {
  if (data.title?.length) {
    const title = convertHtmlStringToPlain(data.title);
    const children: Section[] = [];
    for (const c of data.children || []) {
      const subNodes = getAllSections(c, level + 1);
      if (subNodes instanceof Array) children.push(...subNodes);
      else children.push(subNodes);
    }
    return { id: data.id, title, level, children } as Section;
  }
  const sections: Section[] = [];
  for (const c of data.children || []) {
    const subNodes = getAllSections(c, level);
    if (subNodes instanceof Array) sections.push(...subNodes);
    else sections.push(subNodes);
  }
  return sections;
}

function joinerForLevel(level: number) {
  switch (level) {
    case 1:
      return '\n\n';
    case 2:
      return '\\\n';
    default:
      return ', ';
  }
}

function sectionTitleWithFormatting(title: string, level: number) {
  switch (level) {
    case 1:
      return `**${title}**`;
    case 2:
      return `*${title}*`;
    default:
      return title;
  }
}

function joinSectionWithChildren(
  parent: string,
  parentLevel: number,
  children: string
) {
  const formattedParent = sectionTitleWithFormatting(parent, parentLevel);
  switch (parentLevel) {
    case 1:
      return `${formattedParent}\\\n${children}`;
    case 2:
      return `${formattedParent}\\\n${children}`;
    default:
      return `${formattedParent} (${children})`;
  }
}

function getCoveredSections(
  sections: Section[],
  waitTill: string | undefined,
  end: string | undefined
): { desc: string; started: boolean; stop: boolean } {
  const descPieces: string[] = [];
  let stop = false;
  for (const section of sections) {
    const { title, level } = section;
    let justStarted = false;
    if (waitTill && title === waitTill) {
      waitTill = undefined;
      justStarted = true;
    }
    if (!waitTill && end === title) {
      stop = true;
      if (!justStarted && !waitTill)
        descPieces.push(sectionTitleWithFormatting(title, level));
      break;
    }

    const secInfo = getCoveredSections(section.children, waitTill, end);
    const childDesc = secInfo.desc;
    if (childDesc.length) {
      descPieces.push(joinSectionWithChildren(title, level, childDesc));
    } else if (!justStarted && !waitTill) {
      descPieces.push(sectionTitleWithFormatting(title, level));
    }
    if (secInfo.started) waitTill = undefined;
    if (secInfo.stop) {
      stop = true;
      break;
    }
  }
  const joiner = joinerForLevel(sections[0]?.level);
  return { desc: descPieces.join(joiner), started: !waitTill, stop };
}

export function RecordedSyllabus({ courseId }: { courseId: string }) {
  const [coverageTimeline, setCoverageTimeline] = useState<CoverageTimeline>(
    {}
  );
  const { mmtUrl } = useContext(ServerLinksContext);
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    axios
      .get('/api/get-coverage-timeline')
      .then((resp) => setCoverageTimeline(resp.data));
  }, []);

  useEffect(() => {
    async function getSections() {
      const { notesArchive, notesFilepath } = COURSES_INFO[courseId];
      const resp = await axios.get(
        `${mmtUrl}/:sTeX/sections?archive=${notesArchive}&filepath=${notesFilepath}`
      );
      setSections(getAllSections(resp.data as SectionsAPIData) as Section[]);
    }
    getSections();
  }, [mmtUrl, courseId]);

  if (!courseId) return null;
  const snaps = coverageTimeline[courseId];
  if (!snaps || !sections?.length) return null;

  return (
    <Box mt="10px">
      <table>
        <tr>
          <th style={{ textAlign: 'left' }}>Date</th>
          <th style={{ textAlign: 'left' }}>Topics</th>
          <th style={{ textAlign: 'left' }}>Video</th>
        </tr>
        {snaps.map((item, idx) => (
          <tr key={item.timestamp_ms} style={{ border: '1px solid black' }}>
            <td style={{ textAlign: 'center', minWidth: '100px' }}>
              <b>{idx + 1}.&nbsp;</b>
              {dayjs(item.timestamp_ms).format('DD-MMM')}
            </td>
            <td style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <MdViewer
                content={
                  getCoveredSections(
                    sections,
                    idx > 0 ? snaps[idx - 1].sectionName : undefined,
                    item.sectionName
                  ).desc
                }
              />
            </td>
            <td>
              {item.clipId?.length > 0 && (
                <a
                  href={`https://fau.tv/clip/id/${item.clipId}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <IconButton size="large" sx={{ m: '10px' }}>
                    <OndemandVideoIcon />
                  </IconButton>
                </a>
              )}
            </td>
          </tr>
        ))}
      </table>
    </Box>
  );
}
