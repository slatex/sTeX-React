/* tslint:disable */
/* eslint-disable */
/**
 * sets the server url used to the provided one; by default `https://flams.mathhub.info`.
 */
export function set_server_url(server_url: string): void;
/**
 * activates debug logging
 */
export function set_debug_log(): void;
/**
 * render an FTML document to the provided element
 * #### Errors
 */
export function render_document(to: HTMLElement, document: DocumentOptions, on_section_start?: (uri: string) => (LeptosContinuation | undefined) | null, on_section_end?: (uri: string) => (LeptosContinuation | undefined) | null, context?: LeptosContext | null): FTMLMountHandle;
/**
 * render an FTML document fragment to the provided element
 * #### Errors
 */
export function render_fragment_with_cont(to: HTMLElement, fragment: FragmentOptions, context: LeptosContext | null | undefined, exercise_cont: (r:ExerciseResponse) => void): FTMLMountHandle;
/**
 * render an FTML document fragment to the provided element
 * #### Errors
 */
export function render_fragment(to: HTMLElement, fragment: FragmentOptions, context?: LeptosContext | null, exercise_options?: ExerciseOption | null): FTMLMountHandle;
/**
 * sets up a leptos context for rendering FTML documents or fragments.
 * If a context already exists, does nothing, so is cheap to call
 * [render_document] and [render_fragment] also inject a context
 * iff none already exists, so this is optional in every case.
 */
export function ftml_setup(to: HTMLElement, cont: LeptosContinuation): FTMLMountHandle;
/**
 * #### Errors
 */
export function get_document_html(doc: string): Promise<HTMLFragment>;
/**
 * #### Errors
 */
export function get_paragraph_html(elem: string): Promise<HTMLFragment>;
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
 * Options for rendering an FTML document
 * - `FromBackend`: calls the backend for the document
 *     uri: the URI of the document (as string)
 *     toc: if defined, will render a table of contents for the document
 * - `HtmlString`: render the provided HTML String
 *     html: the HTML String
 *     toc: if defined, will render a table of contents for the document
 */
export type DocumentOptions = { FromBackend: { uri: string; toc: TOCOptions | undefined } } | { HtmlString: { html: string; toc: TOCElem[] | undefined } };

/**
 * Options for rendering an FTML document fragment
 * - `FromBackend`: calls the backend for the document fragment
 *     uri: the URI of the document fragment (as string)
 * - `HtmlString`: render the provided HTML String
 *     html: the HTML String
 */
export type FragmentOptions = { FromBackend: { uri: string } } | { HtmlString: { uri: string | undefined; html: string } };

/**
 * Options for rendering a table of contents
 * `FromBackend` will retrieve it from the remote backend
 * `Predefined(toc)` will render the provided TOC
 */
export type TOCOptions = "FromBackend" | { Predefined: TOCElem[] };

export type ExerciseOption = { WithFeedback: [string,ExerciseFeedback][] } | { WithSolutions: [string,Solutions][] };

export interface HTMLFragment {
    css: CSS[];
    html: string;
}

export interface ExerciseResponse {
    uri: string;
    responses: ExerciseResponseType[];
}

/**
 * Either a list of booleans (multiple choice), a single integer (single choice),
 * or a string (fill-in-the-gaps)
 */
export type ExerciseResponseType = boolean[] | number | string;

export type CSS = { Link: string } | { Inline: string } | { Class: { name: string; css: string } };

export type LeptosContinuation = (e:HTMLDivElement,o:LeptosContext) => void;

/**
 * An entry in a table of contents. Either:
 * 1. a section; the title is assumed to be an HTML string, or
 * 2. an inputref to some other document; the URI is the one for the
 *    inputref itself; not the referenced Document. For the TOC,
 *    which document is inputrefed is actually irrelevant.
 */
export type TOCElem = { Section: { title: string | undefined; uri: string; id: string; children: TOCElem[] } } | { Inputref: { uri: string; title: string | undefined; id: string; children: TOCElem[] } };

/**
 * A Table of contents; Either:
 * 1. an already known TOC, consisting of a list of [`TOCElem`]s, or
 * 2. the URI of a Document. In that case, the relevant FLAMS server
 *    will be requested to obtain the TOC for that document.
 */
export type TOC = { Full: TOCElem[] } | { Get: string };

export class ExerciseFeedback {
  private constructor();
  free(): void;
  static from_json(json: string): ExerciseFeedback | undefined;
  to_json(): string | undefined;
  correct: boolean;
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
}
export class Solutions {
  private constructor();
  free(): void;
  static from_json(json: string): Solutions | undefined;
  to_json(): string | undefined;
  check_response(response: ExerciseResponse): ExerciseFeedback | undefined;
}
