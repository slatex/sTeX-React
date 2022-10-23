import { PREVALUATED_COURSE_TREES } from "./prevaluated-course-trees";

export interface CourseSectionInfo  {
  [sectionTitle: string]: {
    [deckId: string]: { clipId?: string; timestampSec?: number, sec?: string };
  };
};

export const AI_1_COURSE_SECTIONS: CourseSectionInfo = {
  'Preface': {
    initial: { clipId: '43840', timestampSec: 14},
    'MiKoMH/AI||course/sec/acknowledgements.en.xhtml': {clipId: '43840', timestampSec: 120 },
  },
  'Administrativa': {
    'MiKoMH/AI||course/sec/syllabus21-22.en.xhtml': { clipId: '43840', timestampSec: 685  },
    'MiKoMH/AI||course/slides/prerequisites.en.xhtml': { clipId: '43840', timestampSec: 1262 },
    'MiKoMH/AI||course/slides/grading.en.xhtml': { clipId: '43840', timestampSec: 1682 },
    'MiKoMH/AI||course/slides/homeworks.en.xhtml': { clipId: '43840', timestampSec: 1956 },
    'MiKoMH/AI||course/slides/uebungen.en.xhtml': {clipId: '43840', timestampSec: 3170 },
    'MiKoMH/AI||course/snip/discussion.en.xhtml': { clipId: '43840', timestampSec: 3558 },
  },
  'Format of AI Course/Lecturing': {
    'MiKoMH/AI||course/slides/special-admin.en.xhtml': {clipId: '43840', timestampSec: 3723 },
    'MiKoMH/AI||course/snip/lecturing-style-intro.en.xhtml': {clipId: '43840', timestampSec: 3900 },
    'MiKoMH/AI||course/slides/my-lectures.en.xhtml': {clipId: '43840', timestampSec: 4012 }
  },
  'Artificial Intelligence - Who?, What?, When?, Where?, and Why?': {
    'MiKoMH/AI||course/slides/questionnaire-call.en.xhtml': { clipId: '44933', timestampSec: 700 },
    'MiKoMH/AI||course/slides/plot.en.xhtml': { clipId: '44933', sec: '1', timestampSec: 752 },
    'MiKoMH/AI||intro/slides/whatisai-parts.en.xhtml': { clipId: '44933', sec: '2', timestampSec: 2718 },
    'MiKoMH/AI||intro/slides/ai-conundrum.en.xhtml': { clipId: '44933', sec: '3' , timestampSec: 3863 },
    'MiKoMH/AI||course/slides/alphago-here.en.xhtml': { clipId: '21724', sec: '4' },
    'MiKoMH/AI||intro/slides/agi.en.xhtml': { clipId: '21719', sec: '5' },
    'MiKoMH/AI||course/slides/ai2-topics.en.xhtml': { clipId: '21719' },
    'MiKoMH/AI||course/slides/ai1sysproj.en.xhtml': { clipId: '21725', sec: '6' },
  },
  'Logic Programming': {
    'MiKoMH/AI||course/slides/enough.en.xhtml': { clipId: '21752' },
    'MiKoMH/AI||logic/snip/declarative-programming.en.xhtml': { clipId: '21753', sec: '1' },
    'MiKoMH/AI||prolog/slides/fallible-greeks.en.xhtml': { clipId: '21754', sec: '2' },
    'MiKoMH/AI||prolog/slides/DFS-back-ex.en.xhtml': { clipId: '21827', sec: '2.2' },
    'MiKoMH/AI||prolog/slides/relational-programming.en.xhtml': { sec: '2.3'}
  },
  'Dont show me, i am just to end the last deck': {
    'MiKoMH/AI||prolog/slides/rtfm.en.xhtml': { },
  }
  /*
   '': { clipId: '' },
  */
};

function getNextId(id:string, allIds: string[]) {
  for(const [idx,v] of allIds.entries()) {
    if(v==id) return allIds[idx+1];
  }
  return '';
}

function getSectionIds(courseSections: CourseSectionInfo, notesTree:string) {
  const allIds = notesTree.split('\n').map(line=>{
    const parts = line.split('||');
    return `${parts[1]}||${parts[2]}`;
  });
  const sectionIds: { [nodeId: string]: string } = {};
  for (const [secIdx, [secName, secEntries]] of Object.entries(
    Object.entries(courseSections)
  )) {
    for (const [deckIdx, [id, secInfo]] of Object.entries(
      Object.entries(secEntries)
    )) {
      if (secInfo.sec){
        const nextId = getNextId(id, allIds);
        sectionIds[nextId] = `${+secIdx}.${secInfo.sec}`;
      }
      else if (+deckIdx === 0) {
        const nextId = getNextId(id, allIds);
        sectionIds[nextId] = `${+secIdx}`;
      }
    }
  }
  return sectionIds;
}

export const AI_1_DECK_IDS = ([] as string[]).concat(
  ...Object.values(AI_1_COURSE_SECTIONS).map((v) => Object.keys(v))
);

export const SECTION_IDS = getSectionIds(AI_1_COURSE_SECTIONS, PREVALUATED_COURSE_TREES['ai-1']);
