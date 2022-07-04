import { useContext, useEffect, useState } from 'react';
import { MathJaxBaseContext } from './MathJaxContext';
import { getOuterHTML } from 'domutils';
import { mmtHTMLToReact } from './mmtParser';

export function MathMLDisplay({ mathMLDomNode }: { mathMLDomNode: any }) {
  const [mathNode, setMathNode] = useState<
    string | JSX.Element | JSX.Element[]
  >(<span className="blink">…</span>);
  const mjPromise = useContext(MathJaxBaseContext);
  const onError = (err: any) =>
    console.log(`TypesettingFailed : ${err?.message || err?.toString()}`);

  useEffect(() => {
    if (!mjPromise) throw Error('MathJax not loaded, forgot MathJaxContext?');
    mjPromise.promise
      .then((mathJax) => {
        mathJax.startup.promise
          .then(() => {
            (window as any).MathJax.mathml2chtmlPromise(
              getOuterHTML(mathMLDomNode)
            )
              .then((mathJaxRendered: any) =>
                setMathNode(mmtHTMLToReact(mathJaxRendered.outerHTML))
              )
              .catch(onError);
          })
          .catch(onError);
      })
      .catch(onError);
  }, [mathMLDomNode, mjPromise]);
  return <>{mathNode}</>;
}
