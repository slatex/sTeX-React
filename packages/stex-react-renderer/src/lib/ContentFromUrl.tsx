import { Box, LinearProgress } from '@mui/material';
import axios from 'axios';
import { memo, useContext, useEffect, useState } from 'react';
import { ContentWithHighlight, DisplayReason } from './ContentWithHightlight';
import { ServerLinksContext } from './stex-react-renderer';

export const ContentFromUrl = memo(
  ({
    url,
    modifyRendered = undefined,
    displayReason = undefined,
    topLevelDocUrl = undefined,
    minLoadingHeight = undefined,
    onDataFetched = undefined,
    onRendered = undefined,
  }: {
    url: string;
    modifyRendered?: (node: any) => any;
    displayReason?: DisplayReason;
    topLevelDocUrl?: string;
    minLoadingHeight?: string;
    onDataFetched?: () => void;
    onRendered?: () => void;
  }) => {
    const [mmtHtml, setMmtHtml] = useState<string | undefined>(undefined);
    const { mmtUrl } = useContext(ServerLinksContext);
    useEffect(() => {
      if (!url?.length) return;
      const fullUrl = mmtUrl?.length ? `${mmtUrl}/${url}` : url;
      axios
        .get(fullUrl)
        .catch((e) => {
          console.log(e);
          return null;
        })
        .then((r) => {
          let html = `<span style={{ color: 'red' }}>Error loading: ${url}</span>`;
          if (r?.data) html = r.data;
          onDataFetched?.();
          setMmtHtml(html.trim());
        });
    }, [mmtUrl, url]);

    useEffect(() => {
      if (mmtHtml !== undefined) onRendered?.();
    });

    if (mmtHtml === undefined) {
      return (
        <Box minHeight={minLoadingHeight}>
          <span style={{ fontSize: 'smaller' }}>{url}</span>
          <LinearProgress />
        </Box>
      );
    }
    return (
      <ContentWithHighlight
        mmtHtml={mmtHtml}
        topLevelDocUrl={topLevelDocUrl}
        displayReason={displayReason}
        modifyRendered={modifyRendered}
        renderWrapperParams={{ 'section-url': url }}
      />
    );
  }
);
