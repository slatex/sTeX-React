/* tslint:disable */
/* eslint-disable */
/**
 * activates debug logging
 */
export function set_debug_log(): void;
/**
 * sets up a leptos context for rendering FTML documents or fragments.
 * If a context already exists, does nothing, so is cheap to call
 * [render_document] and [render_fragment] also inject a context
 * iff none already exists, so this is optional in every case.
 */
export function ftml_setup(to: HTMLElement, children: LeptosContinuation, on_section?: (uri: DocumentElementURI,lvl:SectionLevel) => (LeptosContinuation | undefined) | null, on_section_title?: (uri: DocumentElementURI,lvl:SectionLevel) => (LeptosContinuation | undefined) | null, on_paragraph?: (uri: DocumentElementURI,kind:ParagraphKind) => (LeptosContinuation | undefined) | null, on_inputref?: (uri: DocumentURI) => (LeptosContinuation | undefined) | null, on_slide?: (uri: DocumentElementURI) => (LeptosContinuation | undefined) | null, exercise_opts?: ExerciseOption | null, on_exercise?: (r:ExerciseResponse) => void | null): FTMLMountHandle;
/**
 * render an FTML document to the provided element
 * #### Errors
 */
export function render_document(to: HTMLElement, document: DocumentOptions, context?: LeptosContext | null, on_section?: (uri: DocumentElementURI,lvl:SectionLevel) => (LeptosContinuation | undefined) | null, on_section_title?: (uri: DocumentElementURI,lvl:SectionLevel) => (LeptosContinuation | undefined) | null, on_paragraph?: (uri: DocumentElementURI,kind:ParagraphKind) => (LeptosContinuation | undefined) | null, on_inputref?: (uri: DocumentURI) => (LeptosContinuation | undefined) | null, on_slide?: (uri: DocumentElementURI) => (LeptosContinuation | undefined) | null, exercise_opts?: ExerciseOption | null, on_exercise?: (r:ExerciseResponse) => void | null): FTMLMountHandle;
/**
 * render an FTML document fragment to the provided element
 * #### Errors
 */
export function render_fragment(to: HTMLElement, fragment: FragmentOptions, context?: LeptosContext | null, on_section?: (uri: DocumentElementURI,lvl:SectionLevel) => (LeptosContinuation | undefined) | null, on_section_title?: (uri: DocumentElementURI,lvl:SectionLevel) => (LeptosContinuation | undefined) | null, on_paragraph?: (uri: DocumentElementURI,kind:ParagraphKind) => (LeptosContinuation | undefined) | null, on_inputref?: (uri: DocumentURI) => (LeptosContinuation | undefined) | null, on_slide?: (uri: DocumentElementURI) => (LeptosContinuation | undefined) | null, exercise_opts?: ExerciseOption | null, on_exercise?: (r:ExerciseResponse) => void | null): FTMLMountHandle;
/**
 * sets the server url used to the provided one; by default `https://flams.mathhub.info`.
 */
export function set_server_url(server_url: string): void;
/**
 * gets the current server url
 */
export function get_server_url(): string;
/**
 * The `ReadableStreamType` enum.
 *
 * *This API requires the following crate features to be activated: `ReadableStreamType`*
 */
type ReadableStreamType = "bytes";
export interface ExerciseResponse {
    uri: DocumentElementURI;
    responses: ExerciseResponseType[];
}

/**
 * Either a list of booleans (multiple choice), a single integer (single choice),
 * or a string (fill-in-the-gaps)
 */
export type ExerciseResponseType = boolean[] | number | string;

export type CognitiveDimension = "Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate" | "Create";

export interface Quiz {
    css: CSS[];
    title: string | undefined;
    elements: QuizElement[];
    solutions: Map<DocumentElementURI, string>;
}

export type QuizElement = { Section: { title: string; elements: QuizElement[] } } | { Question: QuizQuestion } | { Paragraph: { html: string } };

export interface QuizQuestion {
    html: string;
    uri: DocumentElementURI;
    total_points: number;
    preconditions: [CognitiveDimension, SymbolURI][];
    objectives: [CognitiveDimension, SymbolURI][];
}

export type SlideElement = { type: "Slide"; html: string } | { type: "Paragraph"; html: string } | { type: "Inputref"; uri: DocumentURI } | { type: "Section"; title: string | undefined; children: SlideElement[] };

export interface FileData {
    rel_path: string;
    format: string;
}

export interface DirectoryData {
    rel_path: string;
    summary?: FileStateSummary | undefined;
}

export interface ArchiveGroupData {
    id: ArchiveId;
    summary?: FileStateSummary | undefined;
}

export interface ArchiveData {
    id: ArchiveId;
    git?: string | undefined;
    summary?: FileStateSummary | undefined;
}

export interface Instance {
    semester: string;
    instructors?: string[] | undefined;
}

export type ArchiveIndex = { type: "library"; archive: ArchiveId; title: string; teaser?: string | undefined; thumbnail?: string | undefined } | { type: "book"; title: string; authors: string[]; file: DocumentURI; teaser?: string | undefined; thumbnail?: string | undefined } | { type: "paper"; title: string; authors: string[]; file: DocumentURI; thumbnail?: string | undefined; teaser?: string | undefined; venue?: string | undefined; venue_url?: string | undefined } | { type: "course"; title: string; landing: DocumentURI; acronym: string | undefined; instructors: string[]; institution: string; instances: Instance[]; notes: DocumentURI; slides?: DocumentURI | undefined; thumbnail?: string | undefined; quizzes?: boolean; homeworks?: boolean; teaser?: string | undefined } | { type: "self-study"; title: string; landing: DocumentURI; notes: DocumentURI; acronym?: string | undefined; slides?: DocumentURI | undefined; thumbnail?: string | undefined; teaser?: string | undefined };

export type Institution = { type: "university"; title: string; place: string; country: string; url: string; acronym: string; logo: string } | { type: "school"; title: string; place: string; country: string; url: string; acronym: string; logo: string };

export type ParagraphKind = "Definition" | "Assertion" | "Paragraph" | "Proof" | "SubProof" | "Example";

export type Name = string;

export type DocumentElementURI = string;

export type DocumentURI = string;

export type SearchResultKind = "Document" | "Paragraph" | "Definition" | "Example" | "Assertion" | "Exercise";

export type SearchResult = { Document: DocumentURI } | { Paragraph: { uri: DocumentElementURI; fors: SymbolURI[]; def_like: boolean; kind: SearchResultKind } };

export interface QueryFilter {
    allow_documents?: boolean;
    allow_paragraphs?: boolean;
    allow_definitions?: boolean;
    allow_examples?: boolean;
    allow_assertions?: boolean;
    allow_exercises?: boolean;
    definition_like_only?: boolean;
}

export type Language = "en" | "de" | "fr" | "ro" | "ar" | "bg" | "ru" | "fi" | "tr" | "sl";

export type SymbolURI = string;

export interface FileStateSummary {
    new: number;
    stale: number;
    deleted: number;
    up_to_date: number;
    last_built: Timestamp;
    last_changed: Timestamp;
}

export type SectionLevel = "Part" | "Chapter" | "Section" | "Subsection" | "Subsubsection" | "Paragraph" | "Subparagraph";

export type ArchiveId = string;

export type LOKind = { type: "Definition" } | { type: "Example" } | ({ type: "Exercise" } & CognitiveDimension) | ({ type: "SubExercise" } & CognitiveDimension);

export type CSS = { Link: string } | { Inline: string } | { Class: { name: string; css: string } };

export type Timestamp = number;

/**
 * Options for rendering an FTML document
 * - `FromBackend`: calls the backend for the document
 *     uri: the URI of the document (as string)
 *     toc: if defined, will render a table of contents for the document
 * - `HtmlString`: render the provided HTML String
 *     html: the HTML String
 *     toc: if defined, will render a table of contents for the document
 */
export type DocumentOptions = { uri: DocumentURI; gottos?: Gotto[] | undefined; toc: TOCOptions | undefined } | { html: string; gottos?: Gotto[] | undefined; toc: TOCElem[] | undefined };

/**
 * Options for rendering an FTML document fragment
 * - `FromBackend`: calls the backend for the document fragment
 *     uri: the URI of the document fragment (as string)
 * - `HtmlString`: render the provided HTML String
 *     html: the HTML String
 */
export type FragmentOptions = { uri: DocumentElementURI } | { html: string; uri?: DocumentElementURI | undefined };

/**
 * Options for rendering a table of contents
 * `GET` will retrieve it from the remote backend
 * `TOCElem[]` will render the provided TOC
 */
export type TOCOptions = "GET" | { Predefined: TOCElem[] };

export type ExerciseOption = { WithFeedback: [DocumentElementURI, ExerciseFeedback][] } | { WithSolutions: [DocumentElementURI, Solutions][] };

/**
 * An entry in a table of contents. Either:
 * 1. a section; the title is assumed to be an HTML string, or
 * 2. an inputref to some other document; the URI is the one for the
 *    inputref itself; not the referenced Document. For the TOC,
 *    which document is inputrefed is actually irrelevant.
 */
export type TOCElem = { type: "Section"; title: string | undefined; uri: DocumentElementURI; id: string; children: TOCElem[] } | { type: "SkippedSection"; children: TOCElem[] } | { type: "Inputref"; uri: DocumentURI; title: string | undefined; id: string; children: TOCElem[] } | { type: "Paragraph"; styles: Name[]; kind: ParagraphKind } | { type: "Slide" };

/**
 * A section that has been \"covered\" at the specified timestamp; will be marked accordingly
 * in the TOC.
 */
export interface Gotto {
    uri: DocumentElementURI;
    timestamp?: Timestamp | undefined;
}

export type LeptosContinuation = (e:HTMLDivElement,o:LeptosContext) => void;

export class ExerciseFeedback {
  private constructor();
  free(): void;
  static from_jstring(s: string): ExerciseFeedback | undefined;
  to_jstring(): string | undefined;
  correct: boolean;
  score_fraction: number;
}
export class FTMLMountHandle {
  private constructor();
  free(): void;
  /**
   * unmounts the view and cleans up the reactive system.
   * Not calling this is a memory leak
   */
  unmount(): void;
}
export class IntoUnderlyingByteSource {
  private constructor();
  free(): void;
  start(controller: ReadableByteStreamController): void;
  pull(controller: ReadableByteStreamController): Promise<any>;
  cancel(): void;
  readonly type: ReadableStreamType;
  readonly autoAllocateChunkSize: number;
}
export class IntoUnderlyingSink {
  private constructor();
  free(): void;
  write(chunk: any): Promise<any>;
  close(): Promise<any>;
  abort(reason: any): Promise<any>;
}
export class IntoUnderlyingSource {
  private constructor();
  free(): void;
  pull(controller: ReadableStreamDefaultController): Promise<any>;
  cancel(): void;
}
export class LeptosContext {
  private constructor();
  free(): void;
  /**
   * Cleans up the reactive system.
   * Not calling this is a memory leak
   */
  cleanup(): void;
  wasm_clone(): LeptosContext;
}
export class Solutions {
  private constructor();
  free(): void;
  static from_jstring(s: string): Solutions | undefined;
  to_jstring(): string | undefined;
  check_response(response: ExerciseResponse): ExerciseFeedback | undefined;
}
