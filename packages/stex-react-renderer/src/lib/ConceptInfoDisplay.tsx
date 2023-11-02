import { getUriFragment } from '@stex-react/api';
import { useEffect, useState } from 'react';
import { Box, Tooltip } from '@mui/material';
import { mmtHTMLToReact } from './mmtParser';

export const extractLastWordAfterQuestionMark = (url: string) => {
  const parts = url.split('?');
  return parts[parts.length - 1];
};
const ConceptInfoDisplay = ({ uri }: { uri: string }) => {
  const [uriData, setUriData] = useState<string | null>(null);
  useEffect(() => {
    async function getData() {
      const data = await getUriFragment(uri);
      setUriData(data);
    }
    getData();
  }, [uri]);

  return (
    <Tooltip
      title={
        <Box>
          <Box>{uri}</Box>
          {uriData ? (
            <Box>{mmtHTMLToReact(uriData)}</Box>
          ) : (
            <p>waiting for data</p>
          )}
        </Box>
      }
    >
      <span style={{ color: '#0e90d2' }}>
        {extractLastWordAfterQuestionMark(uri)}
      </span>
    </Tooltip>
  );
};

export default ConceptInfoDisplay;
