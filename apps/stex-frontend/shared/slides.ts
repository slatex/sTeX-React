export interface DeckAndVideoInfo {
  deckId?: string;
  sec?: string;
  titleAsHtml: string;

  r360?: string;
  r720?: string;
  r1080?: string;
  timestampSec?: number;
}

export interface CourseSection {
  sectionTitle: string;
  decks: DeckAndVideoInfo[];
}

export interface CourseInfo {
  sections: CourseSection[];
}

export enum SlideType {
  FRAME = 'FRAME',
  TEXT = 'TEXT',
}

export interface Slide {
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
