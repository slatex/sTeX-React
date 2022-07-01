// Derived from https://github.com/fast-reflexes/better-react-mathjax
import { useContext, useEffect, useRef } from 'react';
import { MathJaxBaseContext } from './MathJaxContext';

// This component is not displayed. It is only used as a workaround.
// We use mathml2chtml for actually rendering math but it seems like the required fonts are
// not loaded if no actual typesetting is done. This function typsets into a hidden span.
const MathJaxHack = ({ children }: { children: any }) => {
  const ref = useRef<HTMLElement>(null);
  const mjPromise = useContext(MathJaxBaseContext);
  // whether initial typesetting of this element has been done or not
  const initLoad = useRef(false);

  // mutex to signal when typesetting is ongoing (without it we may have race conditions)
  const typesetting = useRef(false);

  const onTypesetDone = () => {
    if (!initLoad.current) initLoad.current = true;
    typesetting.current = false;
  };

  // const effectToUse = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
  useEffect(() => {
    if (initLoad.current || typesetting.current) return;
    if (ref.current === null) return;
    if (!mjPromise) throw Error('MathJax not loaded, forgot MathJaxContext?');
    typesetting.current = true;
    mjPromise.promise
      .then((mathJax) => {
        mathJax.startup.promise
          .then(() => {
            mathJax['typesetClear']([ref.current]);
            return mathJax['typesetPromise']([ref.current]);
          })
          .then(onTypesetDone)
          .catch((err) => {
            onTypesetDone();
            console.log(`TypesettingFailed : ${err?.message || err?.toString()}`);
          });
      })
      .catch((err) => {
        onTypesetDone();
        console.log(`TypesettingFailed : ${err?.message || err?.toString()}`);
      });
  });

  return (
    <span style={{ display: 'none' }} ref={ref}>
      {children}
    </span>
  );
};

export default MathJaxHack;
