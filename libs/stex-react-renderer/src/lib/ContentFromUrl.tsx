import { LinearProgress } from '@mui/material';
import axios from 'axios';
import { memo, useEffect, useState } from 'react';
import { ContentWithHighlight } from './ContentWithHightlight';

export const ContentFromUrl = memo(
  ({
    url,
    modifyRendered = (n) => n,
    skipSidebar = false,
    topLevel = false,
  }: {
    url: string;
    modifyRendered?: (node: any) => any;
    skipSidebar?: boolean;
    topLevel?: boolean;
  }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [mmtHtml, setMmtHtml] = useState('');

    useEffect(() => {
      if (!url?.length) return;
      setIsLoading(true);
      axios
        .get(url)
        .catch((_e) => null)
        .then((r) => {
          setIsLoading(false);
          let html = `<span style={{ color: 'red' }}>Error loading: ${url}</span>`;
          if (r?.data) html = r.data;
          setMmtHtml(html);
        });
    }, [url, topLevel]);

    if (isLoading) {
      return (
        <>
          <span style={{ fontSize: 'smaller' }}>{url}</span>
          <LinearProgress />
        </>
      );
    }
    return (
      <ContentWithHighlight
        mmtHtml={mmtHtml}
        modifyRendered={modifyRendered}
        skipSidebar={skipSidebar}
        topLevel={topLevel}
        renderWrapperParams={{ 'section-url': url }}
      />
    );
  }
);
