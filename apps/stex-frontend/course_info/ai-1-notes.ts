import { PREVALUATED_COURSE_TREES } from "./prevaluated-course-trees";

export interface CourseSectionInfo  {
  [sectionTitle: string]: {
    [deckId: string]: { clipId?: string; timestampSec?: number, secNo?: string, skipIfCompetency?: string[] };
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
    'MiKoMH/AI||course/sec/resources.en.xhtml': { clipId: '43840', timestampSec: 4344 },
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
  'Recap': {
    'MiKoMH/AI||prereq/sec/theoinf.en.xhtml': { clipId: '44936', timestampSec: 476,
      skipIfCompetency: [
        'http://mathhub.info/smglom/complexity/mod?timespace-complexity'
      ]
    },
    'MiKoMH/AI||prereq/sec/why-complexity-analysis.en.xhtml': { clipId: '44936', timestampSec: 486,
      skipIfCompetency: [
        'http://mathhub.info/smglom/complexity/mod?timespace-complexity'
      ] 
    },
    'MiKoMH/AI||prereq/slides/complexity-recap.en.xhtml': { clipId: '44936', timestampSec: 687,
      skipIfCompetency: [
        'http://mathhub.info/smglom/complexity/mod?timespace-complexity'
      ] 
    },
    'MiKoMH/AI||prereq/sec/grammar.en.xhtml': { clipId: '44936', timestampSec: 2185,
      skipIfCompetency: [
        'http://mathhub.info/smglom/sets/mod?formal-language'
      ]
    },
    'MiKoMH/AI||nlp/slides/grammar.en.xhtml': { clipId: '44936', timestampSec: 2866,
      skipIfCompetency: [
        'http://mathhub.info/smglom/sets/mod?formal-language'
      ] 
    },
    'MiKoMH/AI||prereq/sec/mathlang.en.xhtml': { clipId: '44936', timestampSec: 4521,
      skipIfCompetency: [
        'http://mathhub.info/smglom/mv/mod?structure?mathematical-structure'
      ] 
    },
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
  'Problem Solving and Search': {
    'MiKoMH/AI||search/snip/partintro.en.xhtml': { clipId: '44938', timestampSec: 2083 },
    'MiKoMH/AI||search/sec/problem-solving.en.xhtml': { secNo: '1', clipId: '44938', timestampSec: 2125 },
    'MiKoMH/AI||search/sec/problem-types.en.xhtml': { secNo: '2', clipId: '44938', timestampSec: 3646 },
    'MiKoMH/AI||search/sec/treesearch.en.xhtml': { secNo: '3', clipId: '44938', timestampSec: 4338 },
    'MiKoMH/AI||search/sec/uninformed-search.en.xhtml': { secNo: '4', clipId: '44938', timestampSec: 4952 },
    'MiKoMH/AI||search/sec/bf-search.en.xhtml': { secNo: '4.1', clipId: '44938', timestampSec: 4985 },
    'MiKoMH/AI||search/sec/df-search.en.xhtml': { secNo: '4.2', clipId: '44939', timestampSec: 774 },
    'MiKoMH/AI||search/sec/usearch-topics.en.xhtml': { secNo: '4.3', clipId: '44939', timestampSec: 1649 },
    'MiKoMH/AI||search/sec/informed-search.en.xhtml': { secNo: '5', clipId: '44939', timestampSec: 1833 },
    'MiKoMH/AI||search/sec/greedy-search.en.xhtml': { secNo: '5.1', clipId: '44939', timestampSec: 2055 },
    'MiKoMH/AI||search/sec/heuristics.en.xhtml': { secNo: '5.2', clipId: '44939', timestampSec: 3306 },
    'MiKoMH/AI||search/sec/a-star.en.xhtml': { secNo: '5.3', clipId: '44939', timestampSec: 3945 },
    'MiKoMH/AI||search/sec/finding-heuristics.en.xhtml': { secNo: '5.4', clipId: '44939', timestampSec: 4732 },
    'MiKoMH/AI||search/sec/local-search.en.xhtml': { secNo: '6', clipId: '44940' },
  },
  'Adversarial Search for Game Playing': {
    'MiKoMH/AI||game-play/sec/game-play.en.xhtml': { clipId: '44940', timestampSec: 1790 },
    'MiKoMH/AI||game-play/sec/minimax.en.xhtml': { secNo: '2', clipId: '44940', timestampSec: 3533 },
    'MiKoMH/AI||game-play/sec/evaluation-functions.en.xhtml': { secNo: '3', clipId: '44940', timestampSec: 4457 },
    'MiKoMH/AI||game-play/sec/alphabeta.en.xhtml': { secNo: '4', clipId: '44941', timestampSec: 642 },
    'MiKoMH/AI||game-play/sec/mcts.en.xhtml': { secNo: '5', clipId: '44941', timestampSec: 1964 },
    'MiKoMH/AI||game-play/sec/soa.en.xhtml': { secNo: '6', clipId: '44941', timestampSec: 4042 },
    'MiKoMH/AI||game-play/sec/concl.en.xhtml': { secNo: '7', clipId: '44941', timestampSec: 4169 },
  },
  'Constraint Satisfaction Problems': {
    'MiKoMH/AI||csp/sec/csp.en.xhtml': { clipId: '44941', timestampSec: 4338 },
    'MiKoMH/AI||csp/sec/csp-motivation.en.xhtml': { secNo: '1', clipId: '44942', timestampSec: 190 },
    'MiKoMH/AI||csp/sec/waltz-algorithm.en.xhtml': { secNo: '2', clipId: '44942', timestampSec: 923 },
    'MiKoMH/AI||csp/sec/csp-def.en.xhtml': { secNo: '3', clipId: '44942', timestampSec: 1474 },
    'MiKoMH/AI||csp/sec/csp-search.en.xhtml': { secNo: '4', clipId: '44942', timestampSec: 2986 },
    'MiKoMH/AI||csp/sec/concl.en.xhtml': { secNo: '5', clipId: '44942', timestampSec: 4606 },
  },
  'Constraint Propagation': {
    'MiKoMH/AI||csp/sec/cspropagation.en.xhtml': { clipId: '44942', timestampSec: 4642 },
    'MiKoMH/AI||csp/sec/csprop-inference.en.xhtml': { secNo: '2', clipId: '44943', timestampSec: 11 },
    'MiKoMH/AI||csp/sec/csprop-fwdcheck.en.xhtml': { secNo: '3', clipId: '44943', timestampSec: 1755 },
    'MiKoMH/AI||csp/sec/csprop-arc-consistency.en.xhtml': { secNo: '4', clipId: '44943', timestampSec: 2372 },
    'MiKoMH/AI||csp/sec/csprop-decomposition.en.xhtml': { secNo: '5', clipId: '44943', timestampSec: 4665 },
    'MiKoMH/AI||csp/sec/csprop-cutset.en.xhtml': { secNo: '6', clipId: '44944', timestampSec: 2249 },
    'MiKoMH/AI||csp/sec/csprop-localsearch.en.xhtml': { secNo: '7', clipId: '44944', timestampSec: 3322 },
    'MiKoMH/AI||csp/sec/csprop-concl.en.xhtml': { secNo: '8', clipId: '44944', timestampSec: 3663 },
  },
  'Propositional Reasoning': {
    'MiKoMH/AI||logic/snip/partintro.en.xhtml': { clipId: '44944', timestampSec: 4068 },
    'MiKoMH/AI||logic/sec/proplog-formal.en.xhtml': { secNo: '2', clipId: '44945', timestampSec: 1621 },
    'MiKoMH/AI||logic/sec/pl0-inference.en.xhtml': { secNo: '3', clipId: '44946', timestampSec: 1085 },
    'MiKoMH/AI||logic/sec/proplog-nd.en.xhtml': { secNo: '4', clipId: '44946', timestampSec: 3268 },
    'MiKoMH/AI||logic/sec/atp0.en.xhtml': { secNo: '5', clipId: '44947', timestampSec: 1011 },
    'MiKoMH/AI||logic/sec/normal-forms.en.xhtml': { secNo: '5.1', clipId: '44947', timestampSec: 2123 },
    'MiKoMH/AI||logic/sec/tableaux-intro.en.xhtml': { secNo: '5.2', clipId: '44947', timestampSec: 2213 },
    'MiKoMH/AI||logic/sec/resolution0.en.xhtml': { secNo: '5.3', clipId: '44948', timestampSec: 2348 },
    'MiKoMH/AI||logic/sec/wumpus-resolution.en.xhtml': { secNo: '6', clipId: '44948', timestampSec: 4330 },
    'MiKoMH/AI||logic/sec/proplog-concl.en.xhtml': { secNo: '7', clipId: '44949', timestampSec: 43 },
  },
  'Formal Systems (Syntax, Semantics, Entailment, and Derivation in General)': {
    'MiKoMH/AI||logic/sec/formal-systems.en.xhtml': { clipId: '44949', timestampSec: 784 },
  },
  'Propositional Reasoning: SAT Solvers': {
    'MiKoMH/AI||logic/sec/propsat.en.xhtml': { clipId: '44949', timestampSec: 2211 },
    'MiKoMH/AI||logic/sec/dpll-intro.en.xhtml': { secNo: '2', clipId: '44949', timestampSec: 3653 },
    'MiKoMH/AI||logic/sec/dpll-resolution.en.xhtml': { secNo: '3', clipId: '44949', timestampSec: 5176 },
    'MiKoMH/AI||logic/sec/dpll-conflict-analysis.en.xhtml': { secNo: '4', clipId: '44950', timestampSec: 1367 },
    'MiKoMH/AI||logic/sec/dpll-clause-learning.en.xhtml': { secNo: '5', clipId: '44950', timestampSec: 2506 },
    'MiKoMH/AI||logic/sec/SAT-phase-transitions.en.xhtml': { secNo: '6', clipId: '44950', timestampSec: 3726 },
    'MiKoMH/AI||logic/sec/propsat-concl.en.xhtml': { secNo: '7', clipId: '44950', timestampSec: 4068 },
  },
  'First Order Predicate Logic': {
    'MiKoMH/AI||logic/sec/pl1.en.xhtml': { clipId: '44950',  timestampSec: 4173 },
    'MiKoMH/AI||logic/sec/fol-alpha-implicit.en.xhtml': { secNo: '2', clipId: '44951', timestampSec: 720 },
    'MiKoMH/AI||logic/sec/basics-alpha-implicit.en.xhtml': { secNo: '2.1', clipId: '44951', timestampSec: 1193 },
    'MiKoMH/AI||logic/sec/substitutions-alpha-implicit.en.xhtml': { secNo: '2.2', clipId: '44951', timestampSec: 3419 },
    'MiKoMH/AI||logic/sec/nd1.en.xhtml': { secNo: '3' },
    'MiKoMH/AI||logic/sec/pl1-conclusion.en.xhtml': { secNo: '4' },
  },
  'Automated Theorem Proving in First-Order Logic': {
    'MiKoMH/AI||logic/sec/atp1.en.xhtml': {  },
  }
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
