// @ts-types="../shtml-viewer/shtml_viewer.d.ts"
import { ReactNode, useContext, useEffect, useRef } from 'react';
import * as FTML from './ftml-viewer/ftml_viewer';
import { SHTMLContext, useLeptosTunnels } from './leptos';

//import { DocumentOptions, TOCOptions } from "../shtml-viewer/shtml_viewer.js";

export type DocumentOptions = { uri: string; toc?: TOC } | { html: string; toc?: TOCElem[] };
export type FragmentOptions = { uri: string } | { html: string; uri?: string };
export type TOC = 'GET' | TOCElem[];
export type TOCElem = {
  uri: string;
  id: string;
  children: TOCElem[];
  kind: 'section' | 'input';
  title?: string;
};

export type ExerciseOptions =
  | { graded: [string, FTML.ExerciseFeedback][] }
  | { withSolutions: [string, FTML.Solutions][] }
  | { onEvent: (r: FTML.ExerciseResponse) => void };

export const FTMLDocument: React.FC<{
  opt: DocumentOptions;
  onSectionBegin?: (s: string) => ReactNode | undefined;
  onSectionEnd?: (s: string) => ReactNode | undefined;
}> = ({ opt, onSectionBegin, onSectionEnd }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const opts = docToShtml(opt);
  const { addTunnel, TunnelRenderer } = useLeptosTunnels();
  const context = useContext(SHTMLContext);

  useEffect(() => {
    if (!mountRef.current) return;
    const on_section_start = onSectionBegin
      ? (uri: string) => {
          const r = onSectionBegin(uri);
          if (r) {
            return (e: HTMLDivElement, o: FTML.LeptosContext) => addTunnel(e, r, o);
          }
        }
      : undefined;
    const on_section_end = onSectionEnd
      ? (uri: string) => {
          const r = onSectionEnd(uri);
          if (r) {
            return (e: HTMLDivElement, o: FTML.LeptosContext) => addTunnel(e, r, o);
          }
        }
      : undefined;
    const cont = context?context.wasm_clone():context;
    const handle = FTML.render_document(
      mountRef.current,
      opts,
      on_section_start,
      on_section_end,
      cont
    );
    return () => {
      handle.unmount();
    };
  }, []);

  return (
    <div style={{ textAlign: 'start' }}>
      <div ref={mountRef} />
      <TunnelRenderer />
    </div>
  );
};

export const FTMLFragment: React.FC<{ opt: FragmentOptions; ex?: ExerciseOptions }> = ({
  opt,
  ex,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const opts = fragmentToShtml(opt);
  const context = useContext(SHTMLContext);

  useEffect(() => {
    if (!mountRef.current) return;
    let handle: any;
    const cont = context?context.wasm_clone():context;
    if (ex) {
      if ('graded' in ex) {
        handle = FTML.render_fragment(mountRef.current, opts, cont, { WithFeedback: ex.graded });
      } else if ('withSolutions' in ex) {
        handle = FTML.render_fragment(mountRef.current, opts, cont, {
          WithSolutions: ex.withSolutions,
        });
      } else {
        handle = FTML.render_fragment_with_cont(mountRef.current, opts, cont, ex.onEvent);
      }
    } else {
      handle = FTML.render_fragment(mountRef.current, opts, cont);
    }

    return () => {
      handle.unmount();
    };
  }, []);

  return (
    <div style={{ textAlign: 'start' }}>
      <div ref={mountRef} />
    </div>
  );
};

function fragmentToShtml(opt: FragmentOptions): FTML.FragmentOptions {
  if ('html' in opt) {
    return { HtmlString: { html: opt.html, uri: opt.uri } };
  } else {
    return { FromBackend: { uri: opt.uri } };
  }
}

function docToShtml(opt: DocumentOptions): FTML.DocumentOptions {
  if ('uri' in opt) {
    const toc = opt.toc ? tocToShtml(opt.toc) : undefined;
    return { FromBackend: { uri: opt.uri, toc: toc } };
  } else {
    const toc = opt.toc ? tocLsToShtml(opt.toc) : undefined;
    return { HtmlString: { html: opt.html, toc: toc } };
  }
}
function tocToShtml(toc: TOC): FTML.TOCOptions {
  if (toc === 'GET') {
    return 'FromBackend';
  }
  return { Predefined: tocLsToShtml(toc) };
}

function tocLsToShtml(toc: TOCElem[]): FTML.TOCElem[] {
  return toc.map((e) => {
    if (e.kind === 'section') {
      return {
        Section: { title: e.title, uri: e.uri, id: e.id, children: tocLsToShtml(e.children) },
      };
    } else {
      return {
        Inputref: { title: e.title, uri: e.uri, id: e.id, children: tocLsToShtml(e.children) },
      };
    }
  });
}
