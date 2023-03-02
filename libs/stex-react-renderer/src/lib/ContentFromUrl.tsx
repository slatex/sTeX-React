import { Box, LinearProgress } from '@mui/material';
import axios from 'axios';
import { memo, useContext, useEffect, useState } from 'react';
import { ContentWithHighlight } from './ContentWithHightlight';
import { ServerLinksContext } from './stex-react-renderer';

export const ContentFromUrl = memo(
  ({
    url,
    modifyRendered = undefined,
    skipSidebar = false,
    topLevel = false,
    minLoadingHeight = undefined,
  }: {
    url: string;
    modifyRendered?: (node: any) => any;
    skipSidebar?: boolean;
    topLevel?: boolean;
    minLoadingHeight?: string;
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
          setMmtHtml(html.trim());
        });
    }, [mmtUrl, url]);

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
        modifyRendered={modifyRendered}
        skipSidebar={skipSidebar}
        topLevel={topLevel}
        renderWrapperParams={{ 'section-url': url }}
      />
    );
  }
);
