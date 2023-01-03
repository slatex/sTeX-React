import { FileLocation } from "@stex-react/utils";

export interface DeckAndVideoInfo {
  deckId?: string;
  secNo?: string;
  titleAsHtml: string;

  clipId?: string;
  timestampSec?: number;
  skipIfCompetency?: string[];
}

export interface ClipDetails {
  r360?: string;
  r720?: string;
  r1080?: string;
  sub?: string;
}

export interface DocumentDashInfo extends FileLocation {
  titleAsHtml: string;
  secId?: string;
  children: DocumentDashInfo[];
}

export interface CourseSection {
  sectionTitle: string;
  decks: DeckAndVideoInfo[];
  isAddlSuggestion: boolean;
}

export interface CourseInfo {
  courseId: string;
  sections: CourseSection[];
}

export enum SlideType {
  FRAME = 'FRAME',
  TEXT = 'TEXT',
}

export interface Slide extends FileLocation {
  slideContent: string;
  slideType: SlideType;
  autoExpand: boolean;
  preNotes: string[];
  postNotes: string[];
}

export interface SlideReturn {
  slides: Slide[];
  foundSection: boolean;
  sectionHasEnded: boolean;
}
