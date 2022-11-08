import OutputIcon from '@mui/icons-material/Output';
import RefreshIcon from '@mui/icons-material/Refresh';
import TimerIcon from '@mui/icons-material/Timer';
import {
  Box,
  Checkbox,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Tooltip,
} from '@mui/material';
import { convertHtmlStringToPlain, localStore } from '@stex-react/utils';
import axios from 'axios';
import { useEffect, useReducer, useState } from 'react';
import NOTES_TREES, { TreeNode } from '../notes-trees.preval';
import { CourseInfo, DeckAndVideoInfo } from '../shared/types';

interface CourseTreeInfo {
  index: { [nodeId: string]: number };
  titles: { [index: number]: string };
}

function saveToLocalStorage(courseInfo: CourseInfo) {
  localStore?.setItem(
    `course-info-${courseInfo.courseId}`,
    JSON.stringify(courseInfo)
  );
  console.log(courseInfo);
}

function updateDeckData(
  courseInfo: CourseInfo,
  deckId: string,
  clipId?: string,
  timestampSec?: number,
  secNo?: string
) {
  for (const sec of courseInfo?.sections || []) {
    for (const [idx, deck] of sec.decks.entries()) {
      if (deck.deckId !== deckId) continue;
      sec.decks[idx].secNo = secNo;
      sec.decks[idx].clipId = clipId;
      sec.decks[idx].timestampSec = timestampSec;
      saveToLocalStorage(courseInfo);
      return;
    }
  }
  alert(`Deck [${deckId}] not found`);
}

function updateSectionTitle(
  courseInfo: CourseInfo,
  deckId: string,
  sectionTitle: string
) {
  for (const sec of courseInfo?.sections || []) {
    for (const [idx, deck] of sec.decks.entries()) {
      if (deck.deckId !== deckId) continue;
      if (idx !== 0) {
        alert(`Deck not starting of chapter idx: ${idx}`);
        return;
      }
      sec.sectionTitle = sectionTitle;
      saveToLocalStorage(courseInfo);
      return;
    }
  }
  alert(`Deck [${deckId}] not found`);
}

function removeDeck(courseInfo: CourseInfo, deckId: string) {
  for (const [secIdx, sec] of courseInfo?.sections.entries() || []) {
    for (const [deckIdx, deck] of sec.decks.entries()) {
      if (deck.deckId !== deckId) continue;
      sec.decks.splice(deckIdx, 1);
      if (sec.decks.length === 0) {
        courseInfo.sections.splice(secIdx, 1);
      }
      saveToLocalStorage(courseInfo);
      return;
    }
  }
  alert(`Deck [${deckId}] not found`);
}

function getTitle(startIndex: number, courseTreeInfo: CourseTreeInfo) {
  for (let i = startIndex; ; i++) {
    const titleAsHtml = courseTreeInfo.titles[`${i}`];
    // console.log(titleAsHtml);
    if (titleAsHtml === undefined) return 'Title error';
    const text = convertHtmlStringToPlain(titleAsHtml);
    if (text?.trim().length) return titleAsHtml;
  }
}

function addDeck(
  courseInfo: CourseInfo,
  nodeId: string,
  courseTreeInfo: CourseTreeInfo
) {
  const nodeIndex = courseTreeInfo.index[nodeId];
  console.log(`${nodeId} - ${nodeIndex}`);
  const newDeck: DeckAndVideoInfo = {
    deckId: nodeId,
    titleAsHtml: getTitle(nodeIndex, courseTreeInfo),
  };
  for (const [secIdx, sec] of courseInfo?.sections.entries() || []) {
    for (const [deckIdx, deck] of sec.decks.entries()) {
      console.log(`${deck.deckId} - ${courseTreeInfo.index[deck.deckId]}`);
      if (courseTreeInfo.index[deck.deckId] < nodeIndex) continue;
      console.log(`${secIdx} - ${deckIdx}`);
      if (deckIdx === 0) {
        if (secIdx === 0) {
          alert('Operation not implemented');
          return;
        }
        courseInfo.sections[secIdx - 1].decks.push(newDeck);
      } else {
        courseInfo.sections[secIdx].decks.splice(deckIdx, 0, newDeck);
      }
      saveToLocalStorage(courseInfo);
      return;
    }
  }
  const numSections = courseInfo?.sections.length || 0;
  if (numSections) {
    console.log('adding at the end');
    courseInfo.sections[numSections - 1].decks.push(newDeck);
    saveToLocalStorage(courseInfo);
  }
}

function makeChapter(
  courseInfo: CourseInfo,
  deckId: string,
  courseTreeInfo: CourseTreeInfo
) {
  const nodeIndex = courseTreeInfo.index[deckId];
  for (const [secIdx, sec] of courseInfo?.sections.entries() || []) {
    for (const [deckIdx, deck] of sec.decks.entries()) {
      if (deck.deckId !== deckId) continue;
      if (deckIdx === 0) {
        alert(`Deck [${deckId}] is already a chapter`);
        return;
      }
      const newChapterDecks = sec.decks.slice(deckIdx);
      sec.decks.length = deckIdx;
      courseInfo.sections.splice(secIdx + 1, 0, {
        sectionTitle: convertHtmlStringToPlain(
          getTitle(nodeIndex, courseTreeInfo)
        ),
        decks: newChapterDecks,
      });
      saveToLocalStorage(courseInfo);
      return;
    }
  }
  alert(`Deck [${deckId}] not found`);
}

function removeAsChapter(courseInfo: CourseInfo, deckId: string) {
  for (const [secIdx, sec] of courseInfo?.sections.entries() || []) {
    for (const [deckIdx, deck] of sec.decks.entries()) {
      if (deck.deckId !== deckId) continue;
      if (deckIdx !== 0) {
        alert(`Deck [${deckId}] is not a chapter`);
        return;
      }
      if (secIdx === 0) {
        alert(`cant remove first chapter`);
        return;
      }
      courseInfo.sections[secIdx - 1].decks.push(
        ...courseInfo.sections[secIdx].decks
      );
      courseInfo.sections.splice(secIdx, 1);
      saveToLocalStorage(courseInfo);
      return;
    }
  }
  alert(`Deck [${deckId}] not found`);
}

function getClipsList(courseInfo: CourseInfo) {
  if (!courseInfo?.sections?.length) return [];
  const clips = [];
  for (const sec of courseInfo.sections) {
    for (const deck of sec.decks) {
      if (deck.clipId) clips.push(deck.clipId);
    }
  }
  return [...new Set(clips)];
}

function NotesSidePanel({
  notesNode,
  courseInfo,
  availableClips,
  courseTreeInfo,
}: {
  notesNode: TreeNode;
  courseInfo: CourseInfo;
  availableClips: string[];
  courseTreeInfo: CourseTreeInfo;
}) {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const id = `${notesNode.archive}||${notesNode.filepath}`;
  let deck: DeckAndVideoInfo = null;

  let secTitle = undefined;
  for (const sec of courseInfo?.sections || []) {
    const idx = sec.decks.findIndex((d) => d.deckId === id);
    if (idx !== -1) {
      deck = sec.decks[idx];
      if (idx === 0) {
        console.log(sec.decks);
        secTitle = sec.sectionTitle;
      }
    }
  }
  const fontWeight = deck ? 'bold' : undefined;
  const color = secTitle === undefined ? undefined : 'red';
  const html =
    notesNode.titleAsHtml === '<div></div>'
      ? 'Untitled'
      : notesNode.titleAsHtml;
  const titleText = convertHtmlStringToPlain(html);
  const totalSec = deck?.timestampSec || 0;
  const hour = Math.floor(totalSec / 3600);
  const minute = Math.floor((totalSec - hour * 3600) / 60);
  const sec = totalSec - hour * 3600 - minute * 60;
  return (
    <>
      <Box
        sx={{
          border: deck ? '1px solid #CCC' : undefined,
          borderRadius: '5px',
          pb: '5px',
        }}
      >
        <Tooltip title={id}>
          <Box sx={{ fontWeight, color }} display="flex" alignItems="center">
            <Checkbox
              checked={!!deck}
              onChange={(e) => {
                const checked = e.target.checked;
                if (checked) {
                  addDeck(courseInfo, id, courseTreeInfo);
                } else {
                  removeDeck(courseInfo, id);
                }
                forceUpdate();
              }}
              size="small"
              sx={{ p: '0' }}
            />
            {titleText || 'Top'}
          </Box>
        </Tooltip>
        {deck && (
          <Box display="flex" alignItems="center">
            <Checkbox
              checked={!!secTitle}
              onChange={(e) => {
                const isChapter = e.target.checked;
                if (isChapter) {
                  makeChapter(courseInfo, id, courseTreeInfo);
                } else {
                  removeAsChapter(courseInfo, id);
                }
                forceUpdate();
              }}
              size="small"
              sx={{ p: '0' }}
            />
            Chap&nbsp;
            <TextField
              value={deck.secNo}
              onChange={(e) => {
                const sec = e.target.value;
                updateDeckData(courseInfo, id, deck.clipId, totalSec, sec);
                forceUpdate();
              }}
              size="small"
              sx={{ width: '50px', mr: '5px' }}
            />
            <Select
              value={deck.clipId}
              onChange={(e) => {
                let clip = e.target.value;
                if (clip === 'new') {
                  clip = prompt('Enter new clip id');
                  if (!clip.length) return;
                }
                updateDeckData(courseInfo, id, clip, totalSec, deck.secNo);
                forceUpdate();
              }}
              variant="standard"
            >
              {availableClips.map((clip) => (
                <MenuItem key={clip} value={clip}>
                  {clip}
                </MenuItem>
              ))}
              <MenuItem value="new">New</MenuItem>
            </Select>
            <TextField
              value={hour}
              onChange={(e) => {
                const h = +e.target.value;
                const time = h * 3600 + minute * 60 + sec;
                updateDeckData(courseInfo, id, deck.clipId, time, deck.secNo);
                forceUpdate();
              }}
              size="small"
              sx={{ width: '37px', mx: '5px' }}
            />
            <TextField
              value={minute}
              onChange={(e) => {
                const m = +e.target.value;
                const time = hour * 3600 + m * 60 + sec;
                updateDeckData(courseInfo, id, deck.clipId, time, deck.secNo);
                forceUpdate();
              }}
              size="small"
              sx={{ width: '47px', mr: '5px' }}
            />
            <TextField
              value={sec}
              onChange={(e) => {
                const s = +e.target.value;
                const time = hour * 3600 + minute * 60 + s;
                updateDeckData(courseInfo, id, deck.clipId, time, deck.secNo);
                forceUpdate();
              }}
              size="small"
              sx={{ width: '47px', mr: '5px' }}
            />
            <IconButton
              onClick={(e) => {
                const video = document.getElementsByTagName(
                  'video'
                )?.[0] as HTMLVideoElement;
                if (!video) {
                  alert('Video element not found');
                  return;
                }
                const t = Math.round(video.currentTime);
                updateDeckData(courseInfo, id, deck.clipId, t, deck.secNo);
                forceUpdate();
              }}
            >
              <TimerIcon />
            </IconButton>
          </Box>
        )}
        {secTitle && (
          <TextField
            value={secTitle}
            onChange={(e) => {
              const title = e.target.value;
              updateSectionTitle(courseInfo, id, title);
              forceUpdate();
            }}
            size="small"
            sx={{ mr: '5px' }}
          />
        )}
      </Box>
      <Box ml="10px">
        {notesNode.children.map((c) => (
          <NotesSidePanel
            key={id}
            notesNode={c}
            courseInfo={courseInfo}
            availableClips={availableClips}
            courseTreeInfo={courseTreeInfo}
          />
        ))}
      </Box>
    </>
  );
}

function courseInfoToConfig(courseInfo: CourseInfo) {
  if (!courseInfo?.sections.length) {
    console.log('no course info');
    return '';
  }
  let config = '';
  for (const section of courseInfo.sections) {
    config += `'${section.sectionTitle}': {\n`;
    for (const deck of section.decks) {
      const parts = [] as string[];
      if (deck.secNo) parts.push(`secNo: '${deck.secNo}'`);
      if (deck.clipId) parts.push(`clipId: '${deck.clipId}'`);
      if (deck.timestampSec) parts.push(`timestampSec: ${deck.timestampSec}`);
      config += `  '${deck.deckId}': { ${parts.join(', ')} },\n`;
    }
    config += `},\n`;
  }
  return config;
}

export function CourseSectioning({
  courseInfo,
  forceUpdate,
}: {
  courseInfo: CourseInfo;
  forceUpdate: any;
}) {
  const courseId = courseInfo?.courseId;
  const [courseTreeInfo, setCourseTreeInfo] = useState({} as CourseTreeInfo);
  useEffect(() => {
    if (!courseId) return;
    axios.get(`/api/get-tree-info/${courseId}`).then((resp) => {
      setCourseTreeInfo(resp.data);
      console.log(resp.data);
    });
  }, [courseId]);

  return (
    <Box
      sx={{
        minWidth: '420px',
        overflowX: 'hidden',
        ml: '10px',
        whiteSpace: 'nowrap',
      }}
    >
      <Box display="flex">
        <IconButton onClick={() => forceUpdate()}>
          <RefreshIcon />
        </IconButton>
        <IconButton onClick={() => console.log(courseInfoToConfig(courseInfo))}>
          <OutputIcon />
        </IconButton>
      </Box>
      <Box maxHeight="calc(100vh - 110px)" sx={{ overflowY: 'scroll', overflowX: 'clip' }}>
        <NotesSidePanel
          notesNode={NOTES_TREES['ai-1']}
          courseInfo={courseInfo}
          availableClips={getClipsList(courseInfo)}
          courseTreeInfo={courseTreeInfo}
        />
      </Box>
    </Box>
  );
}
