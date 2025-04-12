import * as FTML from './ftml-viewer-base';

export type ProblemResponse = FTML.ProblemResponse;
export type ProblemResponseType = FTML.ProblemResponseType;
export type FTMLProblem = FTML.QuizProblem;
export type DocumentURI = FTML.DocumentURI;
export type SymbolURI = FTML.SymbolURI;
export type DocumentElementURI = FTML.DocumentElementURI;
export type Name = FTML.Name;
export type ParagraphKind = FTML.ParagraphKind;
export type SectionLevel = FTML.SectionLevel;
export type CSS = FTML.CSS;
export type TOCElem = FTML.TOCElem;

/*
export type ExerciseResponse = FTML.ExerciseResponse;
export type ExerciseFeedback = FTML.ExerciseFeedback;
export type ExerciseSolutions = FTML.Solutions;*/

export type Institution = FTML.Institution;
export type ArchiveIndex = FTML.ArchiveIndex;
export type Instance = FTML.Instance;
export type Language = FTML.Language;
export type CognitiveDimension = FTML.CognitiveDimension;
export type LOKind = FTML.LOKind;
export type ArchiveGroup = FTML.ArchiveGroupData;
export type Archive = FTML.ArchiveData;
export type Directory = FTML.DirectoryData;
export type File = FTML.FileData;
export type SearchResult = FTML.SearchResult;
export type QueryFilter = FTML.QueryFilter;
export type FTMLQuiz = FTML.Quiz;
export type SlideElement = FTML.SlideElement;

export type DocumentURIParams =
  | { uri: DocumentURI }
  | { a: string; rp: string }
  | { a: string; p?: string; d: string; l: Language };

export type SymbolURIParams = { uri: SymbolURI } | { a: string; p?: string; m: string; s: string };

export type DocumentElementURIParams =
  | { uri: DocumentElementURI }
  | { a: string; p?: string; d: string; l: Language; e: string };

export type URIParams =
  | { uri: DocumentURI }
  | { a: string } // ArchiveURI
  | { a: string; rp: string } // DocumentURI
  | { a: string; p?: string; d: string; l?: Language } // DocumentURI
  | { a: string; p?: string; d: string; l?: Language; e: string } // DocumentElementURI
  | { a: string; p?: string; m: string; l?: Language } // ModuleURI
  | { a: string; p?: string; m: string; l?: Language; s: string }; // SymbolURI