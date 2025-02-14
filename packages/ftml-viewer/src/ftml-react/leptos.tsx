import { createContext, ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LeptosContext } from "./ftml-viewer/ftml_viewer";

export const SHTMLContext = createContext<LeptosContext | undefined>(undefined);

interface Tunnel {
  element: Element;
  node: ReactNode;
  context:LeptosContext;
  id: string; // for React keys
}


export function useLeptosTunnel() {
  const [tunnel, setTunnel] = useState<Tunnel | undefined>(undefined);

  const addTunnel = (element: Element, node: ReactNode, context:LeptosContext) => {
    const id = Math.random().toString(36).slice(2);
    setTunnel({ element, node, id, context });
    return id; // Return id for later removal
  };

  const removeTunnel = () => {
    if (tunnel) {
      try{tunnel.context.cleanup();} catch (e){console.log("Error cleaning up leptos context:",e)}
    }
    setTunnel(undefined);
  };

  const TunnelRenderer = () => (
      tunnel? 
        createPortal(<SHTMLContext.Provider value={tunnel.context}>{tunnel.node}</SHTMLContext.Provider>, tunnel.element, tunnel.id)
        : <></>
  );

  useEffect(() => {
    return () => {
      if (tunnel) {
        try{tunnel.context.cleanup();} catch (e){console.log("Error cleaning up leptos context:",e)}
      }
    }
  })

  return {
    addTunnel,
    removeTunnel,
    TunnelRenderer
  };
}

export function useLeptosTunnels() {
  const [tunnels, setTunnels] = useState<Tunnel[]>([]);

  const addTunnel = (element: Element, node: ReactNode, context:LeptosContext) => {
    const id = Math.random().toString(36).slice(2);
    setTunnels(prev => [...prev, { element, node, id, context }]);
    return id; // Return id for later removal
  };

  const removeTunnel = (id: string) => {
    setTunnels(prev => prev.filter(tunnel => {
      if (tunnel.id === id) {
        try{tunnel.context.cleanup();} catch (e){console.log("Error cleaning up leptos context:",e)}
      }
      return tunnel.id !== id
    }));
  };

  const TunnelRenderer = () => (
    <>
      {tunnels.map(tunnel => 
        createPortal(<SHTMLContext.Provider value={tunnel.context}>{tunnel.node}</SHTMLContext.Provider>, tunnel.element, tunnel.id)
      )}
    </>
  );

  useEffect(() => {
    return () => {
      tunnels.forEach(tunnel => {
        try{tunnel.context.cleanup();} catch (e){console.log("Error cleaning up leptos context:",e)}
      });
    }
  })

  return {
    addTunnel,
    removeTunnel,
    TunnelRenderer
  };
}

/*
const withLeptosContext = (context:LeptosContext,children:ReactNode) => {
  console.log("WithLeptosContext",context);
  useEffect(() => {
    return () => {
      console.log("Cleaning up leptos context:",context);
      try{context.cleanup();} catch (e){console.log("Error cleaning up leptos context:",e)}
    }
  },[]);
  return <SHTMLContext.Provider value={context}>{children}</SHTMLContext.Provider>
}
  */