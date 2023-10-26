import { getUriFragment } from '@stex-react/api';
import { useEffect, useState } from 'react';
import { mmtHTMLToReact } from '@stex-react/stex-react-renderer';
import { Box, Tooltip } from '@mui/material';

const extractLastWordAfterQuestionMark = (url: string) => {
  const parts = url.split('?');
  return parts[parts.length - 1];
};
const ConceptDataDisplay = ({ uri }: { uri: string }) => {
  const [uriData, setUriData] = useState(null);
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
        <>
          <Box>{uri}</Box>
          {uriData ? (
            <Box>{mmtHTMLToReact(uriData)}</Box>
          ) : (
            <p>waiting for data</p>
          )}
        </>
      }
    >
      <span>{extractLastWordAfterQuestionMark(uri)}</span>
    </Tooltip>
  );
};

export default ConceptDataDisplay;
