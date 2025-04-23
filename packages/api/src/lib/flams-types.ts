import * as FTML from "./ftml-viewer-base";

export type DocumentURI = FTML.DocumentURI;
export type SymbolURI = FTML.SymbolURI;
export type DocumentElementURI = FTML.DocumentElementURI;
export type Name = FTML.Name;
export type FTMLProblem = FTML.QuizProblem;

export type ProblemResponse = FTML.ProblemResponse;
export type ProblemResponseType = FTML.ProblemResponseType;
//export type ProblemFeedback = FTML.ProblemFeedback;
//export type ProblemSolutions = FTML.Solutions;

export type ParagraphKind = FTML.ParagraphKind;
export type SectionLevel = FTML.SectionLevel;
export type CSS = FTML.CSS;
export type TOCElem = FTML.TOCElem;
export type Institution = FTML.Institution;
export type ArchiveIndex = FTML.ArchiveIndex;
export type Instance = FTML.Instance;
export type FTMLLanguage = FTML.Language;
export type CognitiveDimension = FTML.CognitiveDimension;
export type LOKind = FTML.LOKind;
export type ArchiveGroup = FTML.ArchiveGroupData;
export type Archive = FTML.ArchiveData;
export type Directory = FTML.DirectoryData;
export type File = FTML.FileData;
export type SearchResult = FTML.SearchResult;
export type QueryFilter = FTML.QueryFilter;
export type Quiz = FTML.Quiz;
export type SlideElement = FTML.SlideElement;
export type ArchiveId = FTML.ArchiveId;
export type SolutionData = FTML.SolutionData;
export type ProblemFeedbackJson = FTML.ProblemFeedbackJson;
export type OMDoc = FTML.OMDoc;
export type URI = FTML.URI;

export type DocumentURIParams =
  | { uri: DocumentURI }
  | { a: string; rp: string }
  | { a: string; p?: string; d: string; l: FTMLLanguage };

export type SymbolURIParams =
  | { uri: SymbolURI }
  | { a: string; p?: string; m: string; s: string };

export type DocumentElementURIParams =
  | { uri: DocumentElementURI }
  | { a: string; p?: string; d: string; l: FTMLLanguage; e: string };

export type URIParams =
  | { uri: URI }
  | { a: string } // ArchiveURI
  | { a: string; rp: string } // DocumentURI
  | { a: string; p?: string; d: string; l?: FTMLLanguage } // DocumentURI
  | { a: string; p?: string; d: string; l?: FTMLLanguage; e: string } // DocumentElementURI
  | { a: string; p?: string; m: string; l?: FTMLLanguage } // ModuleURI
  | { a: string; p?: string; m: string; l?: FTMLLanguage; s: string }; // SymbolURI
