import { LinearProgress } from '@mui/material';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { TOP_LEVEL } from './collectIndexInfo';
import { HighlightContext, mmtHTMLToReact } from './mmtParser';

export function ContentFromUrl({
  url,
  modifyRendered = (n) => n,
  skipSidebar = false,
  topLevel = false,
}: {
  url: string;
  modifyRendered?: (node: any) => any;
  skipSidebar?: boolean;
  topLevel?: boolean;
}) {
  const [rendered, setRendered] = useState<any>(<></>);
  const [isLoading, setIsLoading] = useState(false);

  const [highlightedParentId, setHighlightedParentId] = useState('');
  const value = useMemo(
    () => ({ highlightedParentId, setHighlightedParentId }),
    [highlightedParentId]
  );

  useEffect(() => {
    if (!url?.length) return;
    setIsLoading(true);
    axios
      .get(url)
      .catch((_e) => null)
      .then((r) => {
        setIsLoading(false);
        if (topLevel) TOP_LEVEL.childNodes = new Map();

        let toShow;
        if (!r) {
          toShow = <span style={{ color: 'red' }}>Error loading: {url}</span>;
        } else {
          toShow = mmtHTMLToReact(r.data, skipSidebar);
        }
        setRendered(toShow);
      });
  }, [url, skipSidebar, topLevel]);

  if (isLoading) {
    return (
      <>
        <span style={{ fontSize: 'smaller' }}>{url}</span>
        <LinearProgress />
      </>
    );
  }
  return (
    <HighlightContext.Provider value={value}>
      <div {...{ 'section-url': url }}>{modifyRendered(rendered)}</div>
    </HighlightContext.Provider>
  );
}
