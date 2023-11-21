import { memo, useEffect, useMemo, useState } from 'react';
import { HighlightContext, mmtHTMLToReact } from './mmtParser';

export const ContentWithHighlight = memo(
  ({
    mmtHtml,
    modifyRendered = undefined,
    renderWrapperParams = {},
  }: {
    mmtHtml: string;
    modifyRendered?: (node: any) => any;
    renderWrapperParams?: { [key: string]: string };
  }) => {
    const [rendered, setRendered] = useState<any>(<></>);
    const [highlightedParentId, setHighlightedParentId] = useState('');
    const value = useMemo(
      () => ({ highlightedParentId, setHighlightedParentId }),
      [highlightedParentId]
    );

    useEffect(() => {
      let rendered = mmtHTMLToReact(mmtHtml);
      if (modifyRendered) rendered = modifyRendered(rendered);
      setRendered(rendered);
    }, [mmtHtml, modifyRendered]);

    return (
      <HighlightContext.Provider value={value}>
        <div {...renderWrapperParams}>{rendered}</div>
      </HighlightContext.Provider>
    );
  }
);
