import { PREVALUATED_COURSE_TREES } from "./prevaluated-course-trees";

export interface CourseSectionInfo  {
  [sectionTitle: string]: {
    [deckId: string]: { clipId?: string; timestampSec?: number, sec?: string };
  };
};

export const AI_1_COURSE_SECTIONS: CourseSectionInfo = {
  'Preface': {
    'MiKoMH/AI||course/notes/notes.xhtml': { clipId: '43840', timestampSec: 14},
    'MiKoMH/AI||course/sec/syllabus.en.xhtml': {clipId: '43840', timestampSec: 120 },
  },
  'Administrativa': {
    'MiKoMH/AI||course/sec/admin.en.xhtml': { clipId: '43840', timestampSec: 685  },
    'MiKoMH/AI||course/slides/grading.en.xhtml': { clipId: '43840', timestampSec: 1262 },
    'MiKoMH/AI||course/slides/homeworks.en.xhtml': { clipId: '43840', timestampSec: 1682 },
    'MiKoMH/AI||course/snip/tutorials-intro.en.xhtml': { clipId: '43840', timestampSec: 1956 },
    'MiKoMH/KWARC||admin/slides/cheating.en.xhtml': {clipId: '43840', timestampSec: 3170 },
    'MiKoMH/AI||course/slides/special-admin.en.xhtml': { clipId: '43840', timestampSec: 3558 },
  },
  'Format of AI Course/Lecturing': {
    'MiKoMH/AI||course/sec/lecturing.en.xhtml': {clipId: '43840', timestampSec: 3723 },
    'MiKoMH/AI||course/slides/traditional-lectures.en.xhtml': {clipId: '43840', timestampSec: 3900 },
    'MiKoMH/AI||course/snip/questionnaire-intro.en.xhtml': {clipId: '43840', timestampSec: 4012 }
  },
  'Artificial Intelligence - Who?, What?, When?, Where?, and Why?': {
    'MiKoMH/AI||course/sec/overview.en.xhtml': { clipId: '44933', timestampSec: 700 },
    'MiKoMH/AI||intro/sec/whatisai.en.xhtml': { sec: '1', clipId: '44933', timestampSec: 752 },
    'MiKoMH/AI||intro/sec/aiexists.en.xhtml': { sec: '2', clipId: '44933', timestampSec: 2718 },
    'MiKoMH/AI||course/sec/two-attacks.en.xhtml': { sec: '3', clipId: '44933', timestampSec: 3863 },
    'MiKoMH/AI||intro/sec/agi.en.xhtml': { sec: '4', clipId: '44934', timestampSec: 5 },
    'MiKoMH/AI||course/sec/topics.en.xhtml': { sec: '5', clipId: '44934', timestampSec: 996 },
    'MiKoMH/AI||course/slides/ai1sysproj.en.xhtml': { clipId: '44934', timestampSec: 1753 },
    'MiKoMH/AI||course/sec/kwarc-ai.en.xhtml': { sec: '6', clipId: '44934', timestampSec: 2081 },
  },
  'Logic Programming': {
    'MiKoMH/AI||intro/snip/partintro.en.xhtml': { clipId: '44934', timestampSec: 2634 },
    'MiKoMH/AI||prolog/sec/intro.en.xhtml': { sec: '1', clipId: '44934', timestampSec: 2827 },
    'MiKoMH/AI||prolog/sec/programming-as-search.en.xhtml': { sec: '2', clipId: '44934', timestampSec: 4723 },
    'MiKoMH/AI||prolog/sec/prolog-features.en.xhtml': { sec: '2.2', clipId: '44934', timestampSec: 5077 },
    'MiKoMH/AI||prolog/sec/prolog-more.en.xhtml': { sec: '2.3', clipId: '44935', timestampSec: 2681 }
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
