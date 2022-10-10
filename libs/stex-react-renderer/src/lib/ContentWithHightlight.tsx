import { memo, useEffect, useMemo, useState } from 'react';
import { resetIndexInfo } from './collectIndexInfo';
import { HighlightContext, mmtHTMLToReact } from './mmtParser';

export const ContentWithHighlight = memo(
  ({
    mmtHtml,
    modifyRendered = undefined,
    skipSidebar = false,
    topLevel = false,
    renderWrapperParams = {},
  }: {
    mmtHtml: string;
    modifyRendered?: (node: any) => any;
    skipSidebar?: boolean;
    topLevel?: boolean;
    renderWrapperParams?: { [key: string]: string };
  }) => {
    const [rendered, setRendered] = useState<any>(<></>);

    const [highlightedParentId, setHighlightedParentId] = useState('');
    const value = useMemo(
      () => ({ highlightedParentId, setHighlightedParentId }),
      [highlightedParentId]
    );

    useEffect(() => {
      if (topLevel) resetIndexInfo();
    }, [mmtHtml, topLevel]);

    useEffect(() => {
      let rendered = mmtHTMLToReact(mmtHtml, skipSidebar);
      if (modifyRendered) rendered = modifyRendered(rendered);
      setRendered(rendered);
    }, [mmtHtml, skipSidebar, modifyRendered]);

    return (
      <HighlightContext.Provider value={value}>
        <div {...renderWrapperParams}>{rendered}</div>
      </HighlightContext.Provider>
    );
  }
);
