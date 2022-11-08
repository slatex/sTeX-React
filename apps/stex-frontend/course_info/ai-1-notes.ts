import { PREVALUATED_COURSE_TREES } from "./prevaluated-course-trees";

export interface CourseSectionInfo  {
  [sectionTitle: string]: {
    [deckId: string]: { clipId?: string; timestampSec?: number, secNo?: string };
  };
};

export const AI_1_COURSE_SECTIONS: CourseSectionInfo = {
  'Preface': {
    'MiKoMH/AI||course/notes/notes.xhtml': { clipId: '43840', timestampSec: 14 },
    'MiKoMH/AI||course/sec/syllabus.en.xhtml': { clipId: '43840', timestampSec: 120 },
  },
  'Administrativa': {
    'MiKoMH/AI||course/sec/admin.en.xhtml': { clipId: '43840', timestampSec: 685 },
    'MiKoMH/AI||course/slides/grading.en.xhtml': { clipId: '43840', timestampSec: 1262 },
    'MiKoMH/AI||course/slides/homeworks.en.xhtml': { clipId: '43840', timestampSec: 1682 },
    'MiKoMH/AI||course/snip/tutorials-intro.en.xhtml': { clipId: '43840', timestampSec: 1956 },
    'MiKoMH/KWARC||admin/slides/cheating.en.xhtml': { clipId: '43840', timestampSec: 3170 },
    'MiKoMH/AI||course/slides/special-admin.en.xhtml': { clipId: '43840', timestampSec: 3558 },
  },
  'Format of AI Course/Lecturing': {
    'MiKoMH/AI||course/sec/lecturing.en.xhtml': { clipId: '43840', timestampSec: 3723 },
    'MiKoMH/AI||course/slides/traditional-lectures.en.xhtml': { clipId: '43840', timestampSec: 3900 },
    'MiKoMH/AI||course/snip/questionnaire-intro.en.xhtml': { clipId: '43840', timestampSec: 4012 },
  },
  'Resources': {
    'MiKoMH/AI||course/sec/resources.en.xhtml': {  },
  },
  'Artificial Intelligence - Who?, What?, When?, Where?, and Why?': {
    'MiKoMH/AI||course/sec/overview.en.xhtml': { clipId: '44933', timestampSec: 700 },
    'MiKoMH/AI||intro/sec/whatisai.en.xhtml': { secNo: '1', clipId: '44933', timestampSec: 752 },
    'MiKoMH/AI||intro/sec/aiexists.en.xhtml': { secNo: '2', clipId: '44933', timestampSec: 2718 },
    'MiKoMH/AI||course/sec/two-attacks.en.xhtml': { secNo: '3', clipId: '44933', timestampSec: 3863 },
    'MiKoMH/AI||intro/sec/agi.en.xhtml': { secNo: '4', clipId: '44934', timestampSec: 5 },
    'MiKoMH/AI||course/sec/topics.en.xhtml': { secNo: '5', clipId: '44934', timestampSec: 996 },
    'MiKoMH/AI||course/slides/ai1sysproj.en.xhtml': { clipId: '44934', timestampSec: 1753 },
    'MiKoMH/AI||course/sec/kwarc-ai.en.xhtml': { secNo: '6', clipId: '44934', timestampSec: 2081 },
  },
  'Logic Programming': {
    'MiKoMH/AI||intro/snip/partintro.en.xhtml': { clipId: '44934', timestampSec: 2634 },
    'MiKoMH/AI||prolog/sec/intro.en.xhtml': { secNo: '1', clipId: '44934', timestampSec: 2827 },
    'MiKoMH/AI||prolog/sec/programming-as-search.en.xhtml': { secNo: '2', clipId: '44934', timestampSec: 4723 },
    'MiKoMH/AI||prolog/sec/prolog-features.en.xhtml': { secNo: '2.2', clipId: '44934', timestampSec: 5077 },
    'MiKoMH/AI||prolog/sec/prolog-more.en.xhtml': { secNo: '2.3', clipId: '44935', timestampSec: 2681 },
  },
  'Rational Agents: a Unifying Framework for Artificial Intelligence': {
    'MiKoMH/AI||rational-agents/sec/rational-agents.en.xhtml': { clipId: '44936', timestampSec: 4942 },
    'MiKoMH/AI||rational-agents/sec/intro.en.xhtml': { secNo: '1', clipId: '44936', timestampSec: 5001 },
    'MiKoMH/AI||rational-agents/sec/agentenv-framework.en.xhtml': { secNo: '2', clipId: '44937', timestampSec: 888 },
    'MiKoMH/AI||rational-agents/sec/rationality.en.xhtml': { secNo: '3', clipId: '44937', timestampSec: 2128 },
    'MiKoMH/AI||rational-agents/sec/envtypes.en.xhtml': { secNo: '4', clipId: '44937', timestampSec: 3116 },
    'MiKoMH/AI||rational-agents/sec/agenttypes.en.xhtml': { secNo: '5', clipId: '44937', timestampSec: 3972 },
    'MiKoMH/AI||rational-agents/sec/agent-states.en.xhtml': { secNo: '6' },
  },
  'Recap': {
    'MiKoMH/AI||prereq/sec/theoinf.en.xhtml': { clipId: '44936', timestampSec: 476 },
    'MiKoMH/AI||prereq/sec/why-complexity-analysis.en.xhtml': { secNo: '1', clipId: '44936', timestampSec: 486 },
    'MiKoMH/AI||prereq/slides/complexity-recap.en.xhtml': { clipId: '44936', timestampSec: 687 },
    'MiKoMH/AI||prereq/sec/grammar.en.xhtml': { secNo: '2', clipId: '44936', timestampSec: 2185 },
    'MiKoMH/AI||nlp/slides/grammar.en.xhtml': { clipId: '44936', timestampSec: 2866 },
    'MiKoMH/AI||prereq/sec/mathlang.en.xhtml': { secNo: '3', clipId: '44936', timestampSec: 4521 },
  },
  'In AI-1 we use a mixture between Math and Programming Styles': {
    'MiKoMH/AI||prereq/slides/mathstruct-overviews.en.xhtml': {  },
  },
  /*
   '': { clipId: '' },
  */
};

function getSectionIds(courseSections: CourseSectionInfo, notesTree:string) {
  const sectionIds: { [nodeId: string]: string } = {};
  for (const [secIdx, [secName, secEntries]] of Object.entries(
    Object.entries(courseSections)
  )) {
    for (const [deckIdx, [id, secInfo]] of Object.entries(
      Object.entries(secEntries)
    )) {
      if (secInfo.secNo){
        sectionIds[id] = `${+secIdx}.${secInfo.secNo}`;
      }
      else if (+deckIdx === 0) {
        sectionIds[id] = `${+secIdx}`;
      }
    }
  }
  return sectionIds;
}

export const AI_1_DECK_IDS = ([] as string[]).concat(
  ...Object.values(AI_1_COURSE_SECTIONS).map((v) => Object.keys(v))
);

export const SECTION_IDS = getSectionIds(AI_1_COURSE_SECTIONS, PREVALUATED_COURSE_TREES['ai-1']);
