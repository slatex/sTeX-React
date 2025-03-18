import * as FTMLT from "./ftml-viewer";//"./ftml-viewer";//
import * as FTML from "./ftml-viewer/ftml-viewer-base";//"./ftml-viewer/ftml-viewer-base";//

import React, { ReactNode, useContext, useEffect, useRef } from "react";
import { FTMLContext, useLeptosTunnel, useLeptosTunnels } from "./leptos";

/** 
 * sets the server url. Reexported for **emphasis**.
 */ 
export const setServerUrl = FTMLT.setServerUrl;

/**
 * Get the FLAMS server URL used globally
 */
export const getServerUrl = FTMLT.getServerUrl;

/**
 * Get the FLAMS server used globally
 */
export const getFlamsServer = FTMLT.getFlamsServer;

/**
 * Turns on debugging messages on the console
 */
export const setDebugLog = FTMLT.setDebugLog;

/**
 * Configurables for FTML rendering.
 * Every attribute is inherited from ancestor nodes *unless explicitly overridden*.
 */
export interface FTMLConfig {
  /**
   * may return a react component to wrap around a section
   * @param uri the uri of the section
   * @param lvl the level of the section
   * @return a react component to wrap around its argument
   */
  onSection?: (uri:FTML.DocumentElementURI, lvl: FTML.SectionLevel) => (((ch:ReactNode) => ReactNode) | undefined),
  /** may return a react component to *insert* after the title of a section
   * @param uri the uri of the section
   * @param lvl the level of the section
   * @return a react component to insert
   */
  onSectionTitle?: (uri:FTML.DocumentElementURI, lvl: FTML.SectionLevel) => (ReactNode | undefined),
  /**
   * may return a react component to wrap around a logical paragraph (e.g. Definition, Example, etc.)
   * @param uri the uri of the paragraph
   * @param kind the paragraph's kind
   * @return a react component to wrap around its argument
   */
  onParagraph?: (uri:FTML.DocumentElementURI, kind: FTML.ParagraphKind) => (((ch:ReactNode) => ReactNode) | undefined),
  /**
   * may return a react component to wrap around a slide)
   * @param uri the uri of the slide
   * @return a react component to wrap around its argument
   */
  onSlide?: (uri:FTML.DocumentElementURI) => (((ch:ReactNode) => ReactNode) | undefined),
  /** 
   * How to handle exercises 
   */
  exercises?: FTMLT.ExerciseConfig
}

/** 
 * See {@link FTMLConfig} 
 */
export interface FTMLSetupArgs extends FTMLConfig {
  children:ReactNode
}

/** 
 * Sets up Leptos' reactive system  
 */
export const FTMLSetup: React.FC<FTMLSetupArgs> = (args) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const main = useLeptosTunnel();
  const {addTunnel,TunnelRenderer} = useLeptosTunnels();

  useEffect(() => {
    if (!mountRef.current) return;
    const handle = FTMLT.ftmlSetup(mountRef.current, (e,o) => {
      main.addTunnel(e,<>{args.children}<TunnelRenderer/></>,o);
    },toConfig(args,addTunnel));
    return () => {
      handle.unmount();
    };
  },[]);

  return <>
    <div ref={mountRef} style={{display:"contents"}}/>
    <main.TunnelRenderer/>
  </>
}


/** 
 * See {@link FTMLConfig} and {@link FTML.DocumentOptions}
 */
export interface FTMLDocumentArgs extends FTMLConfig {
  document: FTML.DocumentOptions
}


/**
 * render an FTML document
 */
export const FTMLDocument: React.FC<FTMLDocumentArgs> = (args) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const {addTunnel,TunnelRenderer} = useLeptosTunnels();
  const context = useContext(FTMLContext);

  useEffect(() => {
    if (!mountRef.current) return;
    const cont = context?context.wasm_clone():context;
    const handle = FTMLT.renderDocument(
      mountRef.current,
      args.document,
      cont,
      toConfig(args,addTunnel)
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
}

/** 
 * See {@link FTMLConfig} and {@link FTML.FragmentOptions}
 */
export interface FTMLFragmentArgs extends FTMLConfig {
  fragment: FTML.FragmentOptions
}


/**
 * render an FTML fragment
 */
export const FTMLFragment: React.FC<FTMLFragmentArgs> = (args) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const {addTunnel,TunnelRenderer} = useLeptosTunnels();
  const context = useContext(FTMLContext);

  useEffect(() => {
    if (!mountRef.current) return;
    const cont = context?context.wasm_clone():context;
    const handle = FTMLT.renderFragment(
      mountRef.current,
      args.fragment,
      cont,
      toConfig(args,addTunnel)
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
}



const ElemToReact: React.FC<{elems:ChildNode[],ctx:FTML.LeptosContext}> = ({elems,ctx}) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.replaceChildren(...elems);
    }
  },[]);
  return <FTMLContext.Provider value={ctx}><div ref={ref} style={{display:"contents"}}/></FTMLContext.Provider>;
}

function elemToReact(elem:HTMLDivElement,ctx:FTML.LeptosContext): ReactNode {
    const chs = Array.from(elem.childNodes);
    chs.forEach((c) => elem.removeChild(c));
    return <ElemToReact elems={chs} ctx={ctx}/>;
}

function toConfig(
  config:FTMLConfig,
  addTunnel:(element: Element, node: ReactNode, context: FTML.LeptosContext) => string
): FTMLT.FTMLConfig {

  const osecO = config.onSection;
  const onSection = osecO?((uri:FTML.DocumentElementURI,lvl:FTML.SectionLevel) => {
    const r = osecO(uri,lvl);
    return r?((elem:HTMLDivElement,ctx:FTML.LeptosContext) => {
      const ret = r(elemToReact(elem,ctx));
      return addTunnel(elem,ret,ctx);
    }):undefined;
  }):undefined;

  const otO = config.onSectionTitle;
  const onSectionTitle = otO?((uri:FTML.DocumentElementURI,lvl:FTML.SectionLevel) => {
    const r = otO(uri,lvl);
    return r?((elem:HTMLDivElement,ctx:FTML.LeptosContext) => {
      addTunnel(elem,r,ctx);
    }):undefined;
  }):undefined;

  const opO = config.onParagraph;
  const onParagraph = opO?((uri:FTML.DocumentElementURI,kind:FTML.ParagraphKind) => {
    const r = opO(uri,kind);
    return r?((elem:HTMLDivElement,ctx:FTML.LeptosContext) => {
      const ret = r(elemToReact(elem,ctx));
      return addTunnel(elem,ret,ctx);
    }):undefined;
  }):undefined;

  const oslideO = config.onSlide;
  const onSlide = oslideO?((uri:FTML.DocumentElementURI) => {
    const r = oslideO(uri);
    return r?((elem:HTMLDivElement,ctx:FTML.LeptosContext) => {
      const ret = r(elemToReact(elem,ctx));
      return addTunnel(elem,ret,ctx);
    }):undefined;
  }):undefined;

 return {
   onSection: onSection,
   onSectionTitle: onSectionTitle,
   onParagraph: onParagraph,
   onSlide: onSlide,
   exercises: config.exercises
 }
}