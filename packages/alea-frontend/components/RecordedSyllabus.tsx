import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import { Box, IconButton } from '@mui/material';
import { SectionInfo } from '@stex-react/api';
import { MdViewer } from '@stex-react/markdown';
import axios from 'axios';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { getLocaleObject } from '../lang/utils';
import { useRouter } from 'next/router';

function joinerForLevel(level: number) {
  switch (level) {
    case 0:
      return '\n\n';
    case 1:
      return '\\\n';
    default:
      return ', ';
  }
}

function sectionTitleWithFormatting(title: string, level: number) {
  switch (level) {
    case 0:
      return `**${title.toUpperCase()}**`;
    case 1:
      return `**${title}**`;
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
    case 0:
      return `${formattedParent}\\\n${children}`;
    case 1:
      return `${formattedParent}\\\n${children}`;
    default:
      return `${formattedParent} (${children})`;
  }
}

function getLectureClipIds(
  sections: SectionInfo[],
  clipIds: { [timestamp_ms: number]: string }
) {
  for (const s of sections) {
    if (s.clipId?.length) clipIds[s.timestamp_ms] = s.clipId;
    getLectureClipIds(s.children, clipIds);
  }
}

function createAndPush(
  obj: { [timestamp_ms: number]: string[] },
  timestamp_ms: number,
  val: string
) {
  if (!obj[timestamp_ms]) obj[timestamp_ms] = [];
  obj[timestamp_ms].push(val);
}
function getLectureDescs(sections: SectionInfo[]): {
  [timestamp_ms: number]: string;
} {
  const descPieces: { [timestamp_ms: number]: string[] } = {};
  for (const section of sections) {
    const { title, level, timestamp_ms } = section;
    if (!timestamp_ms) break;

    const secInfo = getLectureDescs(section.children);
    let addedForThis = false;
    for (const childTimestamp_ms of Object.keys(secInfo).map((n) => +n)) {
      const childDesc = secInfo[childTimestamp_ms];
      if (childDesc.length) {
        const piece = joinSectionWithChildren(title, level, childDesc);
        createAndPush(descPieces, childTimestamp_ms, piece);
        if (childTimestamp_ms === timestamp_ms) addedForThis = true;
      }
    }

    if (!addedForThis) {
      const piece = sectionTitleWithFormatting(title, level);
      createAndPush(descPieces, timestamp_ms, piece);
    }
  }

  const descriptions: { [timestamp_ms: number]: string } = {};
  for (const timestamp_ms of Object.keys(descPieces)) {
    const pieces = descPieces[timestamp_ms];
    const isJoined = pieces.some(
      (piece) => piece.includes(',') || piece.includes('\n')
    );
    const joiner = isJoined ? joinerForLevel(sections[0]?.level) : ', ';
    descriptions[timestamp_ms] = pieces.join(joiner);
  }
  return descriptions;
}

export function RecordedSyllabus({ courseId }: { courseId: string }) {
  const router = useRouter();

  const [lectureDescs, setLectureDescs] = useState<{
    [timestamp_ms: number]: string;
  }>({});
  const [lectureClipIds, setLectureClipIds] = useState<{
    [timestamp_ms: number]: string;
  }>({});

  useEffect(() => {
    if (!courseId) return;
    axios.get(`/api/get-section-info/${courseId}`).then((resp) => {
      setLectureDescs(getLectureDescs(resp.data));
      const clipIds = {};
      getLectureClipIds(resp.data, clipIds);
      setLectureClipIds(clipIds);
    });
  }, [courseId]);

  if (!courseId) return null;
  const rows = Object.keys(lectureDescs).map((n) => +n);
  if (!rows || !rows?.length) return null;
  const hasAnyVideoClip = Object.keys(lectureClipIds).length > 0;

  const { courseHome: t } = getLocaleObject(router);

  return (
    <Box>
      <Box textAlign="center">
        <b style={{ fontSize: '24px' }}>{t.recordedSyllabus}</b>
      </Box>
      <Box mt="10px">
        <table>
          <tr>
            <th style={{ textAlign: 'left' }}>Date</th>
            <th style={{ textAlign: 'left' }}>Topics</th>
            {hasAnyVideoClip && <th style={{ textAlign: 'left' }}>Video</th>}
          </tr>
          {rows.map((timestamp_ms, idx) => (
            <tr key={timestamp_ms} style={{ border: '1px solid black' }}>
              <td style={{ textAlign: 'center', minWidth: '100px' }}>
                <b>{idx + 1}.&nbsp;</b>
                {dayjs(timestamp_ms).format('DD-MMM')}
              </td>
              <td style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <MdViewer content={lectureDescs[timestamp_ms]} />
              </td>
              {hasAnyVideoClip && (
                <td>
                  {lectureClipIds[timestamp_ms]?.length > 0 && (
                    <a
                      href={`https://fau.tv/clip/id/${lectureClipIds[timestamp_ms]}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <IconButton size="large" sx={{ m: '10px' }}>
                        <OndemandVideoIcon />
                      </IconButton>
                    </a>
                  )}
                </td>
              )}
            </tr>
          ))}
        </table>
      </Box>
    </Box>
  );
}
