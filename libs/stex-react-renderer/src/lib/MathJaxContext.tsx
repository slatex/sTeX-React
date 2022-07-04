// Derived from https://github.com/fast-reflexes/better-react-mathjax
import { MathJaxObject } from 'mathjax-full/js/components/startup';
import { createContext, ReactNode, useContext, useRef } from 'react';
export type MathJaxSubscriberProps = {
  version: 3;
  promise: Promise<MathJaxObject>;
};

export const MathJaxBaseContext = createContext<
  MathJaxSubscriberProps | undefined
>(undefined);

const V3_SRC = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/mml-chtml.js';
let v3Promise: Promise<MathJaxObject>;

const MathJaxContext = ({ children }: { children?: ReactNode }) => {
  const previousContext: MathJaxSubscriberProps | undefined =
    useContext(MathJaxBaseContext);
  if (typeof previousContext?.version !== 'undefined')
    throw Error('Nested MathJaxContexts');
  const mjContext = useRef(previousContext);

  function scriptInjector<T>(
    res: (mathJax: T) => void,
    rej: (error: any) => void
  ) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = V3_SRC;
    script.async = false;

    script.addEventListener('load', () => {
      const mathJax = (window as any).MathJax;
      res(mathJax);
    });
    script.addEventListener('error', (e) => rej(e));

    document.getElementsByTagName('head')[0].appendChild(script);
  }

  if (typeof mjContext.current === 'undefined') {
    if (typeof v3Promise === 'undefined' && typeof document !== 'undefined') {
      v3Promise = new Promise<MathJaxObject>(scriptInjector);
      v3Promise.catch((e) => {
        throw Error(
          `Failed to download MathJax version 3 from '${V3_SRC}' due to: ${e}`
        );
      });
    }

    mjContext.current = { version: 3, promise: v3Promise };
  }

  return (
    <MathJaxBaseContext.Provider value={mjContext.current}>
      {children}
    </MathJaxBaseContext.Provider>
  );
};

export default MathJaxContext;
