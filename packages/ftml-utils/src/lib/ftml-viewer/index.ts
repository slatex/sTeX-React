import { FLAMSServer } from '@stex-react/api';
import * as FTML from './ftml-viewer-base'; // "./ftml-viewer-base"; //

const Window:{FLAMS_SERVER_URL:string} = typeof window !== "undefined" ? ((window as unknown) as {FLAMS_SERVER_URL:string}) : {FLAMS_SERVER_URL:""};

/** 
 * Turns on debugging messages on the console
 */
export function setDebugLog() { FTML.set_debug_log(); }

/** 
 * Get the FLAMS server used globally
 */
export function getFlamsServer(): FLAMSServer {
  return new FLAMSServer(Window.FLAMS_SERVER_URL);
}

/** 
 * Set the FLAMS server used globally 
 */
export function setServerUrl(s:string) {
  Window.FLAMS_SERVER_URL = s;
  FTML.set_server_url(s);
}

/** 
 * Get the FLAMS server URL used globally 
 */
export function getServerUrl(): string {
  return Window.FLAMS_SERVER_URL;
}


/**
 * Configuration for rendering FTML content
 */
export interface FTMLConfig {

  /**
   * whether to allow hovers
   */
  allowHovers?: boolean;

  /**
   * callback for wrapping sections
   */
  onSection?: (
    uri: FTML.DocumentElementURI,
    lvl: FTML.SectionLevel,
  ) => FTML.LeptosContinuation | undefined;
  /**
   * callback for *inserting* elements immediately after a section's title
   */
  onSectionTitle?: (
    uri: FTML.DocumentElementURI,
    lvl: FTML.SectionLevel,
  ) => FTML.LeptosContinuation | undefined;
  /**
   * callback for wrapping logical paragraphs (Definitions, Theorems, Examples, etc.)
   */
  onParagraph?: (
    uri: FTML.DocumentElementURI,
    kind: FTML.ParagraphKind,
  ) => FTML.LeptosContinuation | undefined;
  /**
   * callback for wrapping inputreferences (i.e. lazily loaded document fragments)
   */
  onInputref?: (uri: FTML.DocumentURI) => FTML.LeptosContinuation | undefined;
  /**
   * callback for wrapping (beamer presentation) slides
   */
  onSlide?: (
    uri: FTML.DocumentElementURI,
  ) => FTML.LeptosContinuation | undefined;
  
  problemStates?: FTML.ProblemStates | undefined,
  onProblem?: ((response: FTML.ProblemResponse) => void) | undefined,
}


/**
 * sets up a leptos context for rendering FTML documents or fragments.
 * If a context already exists, does nothing, so is cheap to call
 * {@link renderDocument} and {@link renderFragment} also inject a context
 * iff none already exists, so this is optional in every case.
 *
 * @param {HTMLElement} to The element to render into
 * @param {FTML.LeptosContinuation} then The code to execute *within* the leptos context (e.g. various calls to
 *        {@link renderDocument} or {@link renderFragment})
 * @param {FTMLConfig?} cfg Optional configuration
 * @returns {FTML.FTMLMountHandle}; its {@link FTML.FTMLMountHandle.unmount} method removes the context. Not calling
 *          this is a memory leak.
 */
export function ftmlSetup(
  to: HTMLElement,
  then: FTML.LeptosContinuation,
  cfg?: FTMLConfig,
): FTML.FTMLMountHandle {
  return FTML.ftml_setup(
    to,
    then,
    cfg?.allowHovers,
    cfg?.onSection,
    cfg?.onSectionTitle,
    cfg?.onParagraph,
    cfg?.onInputref,
    cfg?.onSlide,
    cfg?.onProblem,
    cfg?.problemStates
  );
}

/**
 * render an FTML document to the provided element
 * @param {HTMLElement} to The element to render into
 * @param {FTML.DocumentOptions} document The document to render
 * @param {FTML.LeptosContext?} context The leptos context to use (if any)
 * @param {FTMLConfig?} cfg Optional configuration
 * @returns {FTML.FTMLMountHandle}; its {@link FTML.FTMLMountHandle.unmount} method removes the context. Not calling
 *          this is a memory leak.
 */
export function renderDocument(
  to: HTMLElement,
  document: FTML.DocumentOptions,
  context?: FTML.LeptosContext,
  cfg?: FTMLConfig,
): FTML.FTMLMountHandle {
  return FTML.render_document(
    to,
    document,
    context,
    cfg?.allowHovers,
    cfg?.onSection,
    cfg?.onSectionTitle,
    cfg?.onParagraph,
    cfg?.onInputref,
    cfg?.onSlide,
    cfg?.onProblem,
    cfg?.problemStates
  );
}

/**
 * render an FTML document fragment to the provided element
 * @param {HTMLElement} to The element to render into
 * @param {FTML.FragmentOptions} fragment The fragment to render
 * @param {FTML.LeptosContext?} context The leptos context to use (if any)
 * @param {FTMLConfig?} cfg Optional configuration
 * @returns {FTML.FTMLMountHandle}; its {@link FTML.FTMLMountHandle.unmount} method removes the context. Not calling
 *          this is a memory leak.
 */
export function renderFragment(
  to: HTMLElement,
  fragment: FTML.FragmentOptions,
  context?: FTML.LeptosContext,
  cfg?: FTMLConfig,
): FTML.FTMLMountHandle {
  return FTML.render_fragment(
    to,
    fragment,
    context,
    cfg?.allowHovers,
    cfg?.onSection,
    cfg?.onSectionTitle,
    cfg?.onParagraph,
    cfg?.onInputref,
    cfg?.onSlide,
    cfg?.onProblem,
    cfg?.problemStates
  );
}