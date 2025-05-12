/* tslint:disable */
/* eslint-disable */
export function injectCss(css: CSS): void;
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
export function ftml_setup(to: HTMLElement, children: LeptosContinuation, allow_hovers?: boolean | null, on_section_title?: (uri: DocumentElementURI,lvl:SectionLevel) => (LeptosContinuation | undefined) | null, on_fragment?: (uri: DocumentElementURI,kind:FragmentKind) => (LeptosContinuation | undefined) | null, on_inputref?: (uri: DocumentURI) => (LeptosContinuation | undefined) | null, on_problem?: (r:ProblemResponse) => void | null, problem_states?: ProblemStates | null): FTMLMountHandle;
/**
 * render an FTML document to the provided element
 * #### Errors
 */
export function render_document(to: HTMLElement, document: DocumentOptions, context?: LeptosContext | null, allow_hovers?: boolean | null, on_section_title?: (uri: DocumentElementURI,lvl:SectionLevel) => (LeptosContinuation | undefined) | null, on_fragment?: (uri: DocumentElementURI,kind:FragmentKind) => (LeptosContinuation | undefined) | null, on_inputref?: (uri: DocumentURI) => (LeptosContinuation | undefined) | null, on_problem?: (r:ProblemResponse) => void | null, problem_states?: ProblemStates | null): FTMLMountHandle;
/**
 * render an FTML document fragment to the provided element
 * #### Errors
 */
export function render_fragment(to: HTMLElement, fragment: FragmentOptions, context?: LeptosContext | null, allow_hovers?: boolean | null, on_section_title?: (uri: DocumentElementURI,lvl:SectionLevel) => (LeptosContinuation | undefined) | null, on_fragment?: (uri: DocumentElementURI,kind:FragmentKind) => (LeptosContinuation | undefined) | null, on_inputref?: (uri: DocumentURI) => (LeptosContinuation | undefined) | null, on_problem?: (r:ProblemResponse) => void | null, problem_states?: ProblemStates | null): FTMLMountHandle;
/**
 * sets the server url used to the provided one; by default `https://mathhub.info`.
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
/**
 * State of a particular problem
 */
export type ProblemState = { type: "Interactive"; current_response?: ProblemResponse | undefined; solution?: SolutionData[] | undefined } | { type: "Finished"; current_response?: ProblemResponse | undefined } | { type: "Graded"; feedback: ProblemFeedbackJson };

export type ProblemStates = Map<DocumentElementURI, ProblemState>;

/**
 * Options for rendering an FTML document
 * - `FromBackend`: calls the backend for the document
 *     uri: the URI of the document (as string)
 *     toc: if defined, will render a table of contents for the document
 * - `HtmlString`: render the provided HTML String
 *     html: the HTML String
 *     toc: if defined, will render a table of contents for the document
 */
export type DocumentOptions = { type: "FromBackend"; uri: DocumentURI; gottos?: Gotto[] | undefined; toc: TOCOptions | undefined } | { type: "HtmlString"; html: string; gottos?: Gotto[] | undefined; toc: TOCElem[] | undefined };

/**
 * Options for rendering an FTML document fragment
 * - `FromBackend`: calls the backend for the document fragment
 *     uri: the URI of the document fragment (as string)
 * - `HtmlString`: render the provided HTML String
 *     html: the HTML String
 */
export type FragmentOptions = { type: "FromBackend"; uri: DocumentElementURI } | { type: "HtmlString"; html: string; uri?: DocumentElementURI | undefined };

/**
 * Options for rendering a table of contents
 * `GET` will retrieve it from the remote backend
 * `TOCElem[]` will render the provided TOC
 */
export type TOCOptions = "GET" | { Predefined: TOCElem[] };

export type LeptosContinuation = (e:HTMLDivElement,o:LeptosContext) => void;

export interface OMDocSymbol {
    uri: SymbolURI;
    df: Term | undefined;
    tp: Term | undefined;
    arity: ArgSpec;
    macro_name: string | undefined;
}

export type OMDocDeclaration = ({ type: "Symbol" } & OMDocSymbol) | ({ type: "NestedModule" } & OMDocModule<OMDocDeclaration>) | ({ type: "Structure" } & OMDocStructure<OMDocDeclaration>) | ({ type: "Morphism" } & OMDocMorphism<OMDocDeclaration>) | ({ type: "Extension" } & OMDocExtension<OMDocDeclaration>);

export interface OMDocExtension<E> {
    uri: SymbolURI;
    target: SymbolURI;
    uses: ModuleURI[];
    children: E[];
}

export interface OMDocStructure<E> {
    uri: SymbolURI;
    macro_name: string | undefined;
    uses: ModuleURI[];
    extends: ModuleURI[];
    children: E[];
    extensions: [SymbolURI, OMDocSymbol[]][];
}

export interface OMDocMorphism<E> {
    uri: SymbolURI;
    total: boolean;
    target: ModuleURI | undefined;
    uses: ModuleURI[];
    children: E[];
}

export interface OMDocModule<E> {
    uri: ModuleURI;
    imports: ModuleURI[];
    uses: ModuleURI[];
    metatheory: ModuleURI | undefined;
    signature: Language | undefined;
    children: E[];
}

export type OMDocDocumentElement = ({ type: "Slide" } & OMDocSlide) | ({ type: "Section" } & OMDocSection) | ({ type: "Module" } & OMDocModule<OMDocDocumentElement>) | ({ type: "Morphism" } & OMDocMorphism<OMDocDocumentElement>) | ({ type: "Structure" } & OMDocStructure<OMDocDocumentElement>) | ({ type: "Extension" } & OMDocExtension<OMDocDocumentElement>) | { type: "DocumentReference"; uri: DocumentURI; title: string | undefined } | ({ type: "Variable" } & OMDocVariable) | ({ type: "Paragraph" } & OMDocParagraph) | ({ type: "Problem" } & OMDocProblem) | { type: "TopTerm"; uri: DocumentElementURI; term: Term } | ({ type: "SymbolDeclaration" } & SymbolURI|OMDocSymbol);

export interface OMDocProblem {
    uri: DocumentElementURI;
    sub_problem: boolean;
    autogradable: boolean;
    points: number | undefined;
    title: string | undefined;
    preconditions: [CognitiveDimension, SymbolURI][];
    objectives: [CognitiveDimension, SymbolURI][];
    uses: ModuleURI[];
    children: OMDocDocumentElement[];
}

export interface OMDocParagraph {
    uri: DocumentElementURI;
    kind: ParagraphKind;
    formatting: ParagraphFormatting;
    uses: ModuleURI[];
    fors: ModuleURI[];
    title: string | undefined;
    children: OMDocDocumentElement[];
    definition_like: boolean;
}

export interface OMDocVariable {
    uri: DocumentElementURI;
    arity: ArgSpec;
    macro_name: string | undefined;
    tp: Term | undefined;
    df: Term | undefined;
    is_seq: boolean;
}

export interface OMDocSlide {
    uri: DocumentElementURI;
    uses: ModuleURI[];
    children: OMDocDocumentElement[];
}

export interface OMDocSection {
    title: string | undefined;
    uri: DocumentElementURI;
    uses: ModuleURI[];
    children: OMDocDocumentElement[];
}

export interface OMDocDocument {
    uri: DocumentURI;
    title: string | undefined;
    uses: ModuleURI[];
    children: OMDocDocumentElement[];
}

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

export type FragmentKind = ({ type: "Section" } & SectionLevel) | ({ type: "Paragraph" } & ParagraphKind) | { type: "Slide" } | { type: "Problem"; is_sub_problem: boolean; is_autogradable: boolean };

export type OMDoc = ({ type: "Slide" } & OMDocSlide) | ({ type: "Document" } & OMDocDocument) | ({ type: "Section" } & OMDocSection) | ({ type: "DocModule" } & OMDocModule<OMDocDocumentElement>) | ({ type: "Module" } & OMDocModule<OMDocDeclaration>) | ({ type: "DocMorphism" } & OMDocMorphism<OMDocDocumentElement>) | ({ type: "Morphism" } & OMDocMorphism<OMDocDeclaration>) | ({ type: "DocStructure" } & OMDocStructure<OMDocDocumentElement>) | ({ type: "Structure" } & OMDocStructure<OMDocDeclaration>) | ({ type: "DocExtension" } & OMDocExtension<OMDocDocumentElement>) | ({ type: "Extension" } & OMDocExtension<OMDocDeclaration>) | ({ type: "SymbolDeclaration" } & OMDocSymbol) | ({ type: "Variable" } & OMDocVariable) | ({ type: "Paragraph" } & OMDocParagraph) | ({ type: "Problem" } & OMDocProblem) | { type: "Term"; uri: DocumentElementURI; term: Term } | { type: "DocReference"; uri: DocumentURI; title: string | undefined } | ({ type: "Other" } & string);

export type SolutionData = { Solution: { html: string; answer_class: string | undefined } } | { ChoiceBlock: ChoiceBlock } | { FillInSol: FillInSol };

export interface ChoiceBlock {
    multiple: boolean;
    inline: boolean;
    range: DocumentRange;
    styles: string[];
    choices: Choice[];
}

export interface Choice {
    correct: boolean;
    verdict: string;
    feedback: string;
}

export interface FillInSol {
    width: number | undefined;
    opts: FillInSolOption[];
}

export type FillInSolOption = { Exact: { value: string; verdict: boolean; feedback: string } } | { NumericalRange: { from: number | undefined; to: number | undefined; verdict: boolean; feedback: string } } | { Regex: { regex: Regex; verdict: boolean; feedback: string } };

export interface ProblemFeedbackJson {
    correct: boolean;
    solutions: string[];
    data: CheckedResult[];
    score_fraction: number;
}

export interface BlockFeedback {
    is_correct: boolean;
    verdict_str: string;
    feedback: string;
}

export interface FillinFeedback {
    is_correct: boolean;
    feedback: string;
    kind: FillinFeedbackKind;
}

export type FillinFeedbackKind = { Exact: string } | { NumRange: { from: number | undefined; to: number | undefined } } | { Regex: string };

export type CheckedResult = { type: "SingleChoice"; selected: number | undefined; choices: BlockFeedback[] } | { type: "MultipleChoice"; selected: boolean[]; choices: BlockFeedback[] } | { type: "FillinSol"; matching: number | undefined; text: string; options: FillinFeedback[] };

export interface ProblemResponse {
    uri: DocumentElementURI;
    responses: ProblemResponseType[];
}

/**
 * Either a list of booleans (multiple choice), a single integer (single choice),
 * or a string (fill-in-the-gaps)
 */
export type ProblemResponseType = { type: "MultipleChoice"; value: boolean[] } | { type: "SingleChoice"; value: number | undefined } | { type: "Fillinsol"; value: string };

export interface AnswerClass {
    id: string;
    feedback: string;
    kind: AnswerKind;
}

export type AnswerKind = { Class: number } | { Trait: number };

export type CognitiveDimension = "Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate" | "Create";

export interface Quiz {
    css: CSS[];
    title: string | undefined;
    elements: QuizElement[];
    solutions: Map<DocumentElementURI, string>;
    answer_classes: Map<DocumentElementURI, AnswerClass[]>;
}

export type QuizElement = { Section: { title: string; elements: QuizElement[] } } | { Problem: QuizProblem } | { Paragraph: { html: string } };

export interface QuizProblem {
    html: string;
    title_html: string | undefined;
    uri: DocumentElementURI;
    total_points: number | undefined;
    preconditions: [CognitiveDimension, SymbolURI][];
    objectives: [CognitiveDimension, SymbolURI][];
}

export type ArchiveId = string;

export type SearchResultKind = "Document" | "Paragraph" | "Definition" | "Example" | "Assertion" | "Problem";

export type SearchResult = { Document: DocumentURI } | { Paragraph: { uri: DocumentElementURI; fors: SymbolURI[]; def_like: boolean; kind: SearchResultKind } };

export interface QueryFilter {
    allow_documents?: boolean;
    allow_paragraphs?: boolean;
    allow_definitions?: boolean;
    allow_examples?: boolean;
    allow_assertions?: boolean;
    allow_problems?: boolean;
    definition_like_only?: boolean;
}

export type SectionLevel = "Part" | "Chapter" | "Section" | "Subsection" | "Subsubsection" | "Paragraph" | "Subparagraph";

export interface FileStateSummary {
    new: number;
    stale: number;
    deleted: number;
    up_to_date: number;
    last_built: Timestamp;
    last_changed: Timestamp;
}

export type Informal = { Term: number } | { Node: { tag: string; attributes: [string, string][]; children: Informal[] } } | { Text: string };

export type Var = { Name: Name } | { Ref: { declaration: DocumentElementURI; is_sequence: boolean | undefined } };

export type ArgMode = "Normal" | "Sequence" | "Binding" | "BindingSequence";

export interface Arg {
    term: Term;
    mode: ArgMode;
}

export type Term = { OMID: ContentURI } | { OMV: Var } | { OMA: { head: Term; args: Arg[] } } | { Field: { record: Term; key: Name; owner: Term | undefined } } | { OML: { name: Name; df: Term | undefined; tp: Term | undefined } } | { Informal: { tag: string; attributes: [string, string][]; children: Informal[]; terms: Term[] } };

export type Name = string;

export type ModuleURI = string;

export type SymbolURI = string;

export type ContentURI = string;

export type DocumentElementURI = string;

export type DocumentURI = string;

export type URI = string;

export type ArgSpec = ArgMode[];

export type LOKind = { type: "Definition" } | { type: "Example" } | ({ type: "Problem" } & CognitiveDimension) | ({ type: "SubProblem" } & CognitiveDimension);

export type Language = "en" | "de" | "fr" | "ro" | "ar" | "bg" | "ru" | "fi" | "tr" | "sl";

export type SlideElement = { type: "Slide"; html: string; uri: DocumentElementURI } | { type: "Paragraph"; html: string; uri: DocumentElementURI } | { type: "Inputref"; uri: DocumentURI } | { type: "Section"; uri: DocumentElementURI; title: string | undefined; children: SlideElement[] };

export interface DocumentRange {
    start: number;
    end: number;
}

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
    TAs?: string[] | undefined;
    leadTAs?: string[] | undefined;
}

export type ArchiveIndex = { type: "library"; archive: ArchiveId; title: string; teaser?: string | undefined; thumbnail?: string | undefined } | { type: "book"; title: string; authors: string[]; file: DocumentURI; teaser?: string | undefined; thumbnail?: string | undefined } | { type: "paper"; title: string; authors: string[]; file: DocumentURI; thumbnail?: string | undefined; teaser?: string | undefined; venue?: string | undefined; venue_url?: string | undefined } | { type: "course"; title: string; landing: DocumentURI; acronym: string | undefined; instructors: string[]; institution: string; instances: Instance[]; notes: DocumentURI; slides?: DocumentURI | undefined; thumbnail?: string | undefined; quizzes?: boolean; homeworks?: boolean; teaser?: string | undefined } | { type: "self-study"; title: string; landing: DocumentURI; notes: DocumentURI; acronym?: string | undefined; slides?: DocumentURI | undefined; thumbnail?: string | undefined; teaser?: string | undefined };

export type Institution = { type: "university"; title: string; place: string; country: string; url: string; acronym: string; logo: string } | { type: "school"; title: string; place: string; country: string; url: string; acronym: string; logo: string };

export type ParagraphKind = "Definition" | "Assertion" | "Paragraph" | "Proof" | "SubProof" | "Example";

export type ParagraphFormatting = "Block" | "Inline" | "Collapsed";

export type CSS = { Link: string } | { Inline: string } | { Class: { name: string; css: string } };

export type Timestamp = number;

export type Regex = string;

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
export class ProblemFeedback {
  private constructor();
  free(): void;
  static from_jstring(s: string): ProblemFeedback | undefined;
  to_jstring(): string | undefined;
  static from_json(arg0: ProblemFeedbackJson): ProblemFeedback;
  to_json(): ProblemFeedbackJson;
  correct: boolean;
  score_fraction: number;
}
export class Solutions {
  private constructor();
  free(): void;
  static from_jstring(s: string): Solutions | undefined;
  to_jstring(): string | undefined;
  static from_solutions(solutions: SolutionData[]): Solutions;
  to_solutions(): SolutionData[];
  check_response(response: ProblemResponse): ProblemFeedback | undefined;
  default_feedback(): ProblemFeedback;
}
