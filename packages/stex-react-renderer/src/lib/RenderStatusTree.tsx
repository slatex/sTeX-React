import { Box, Button } from '@mui/material';
import { SectionsAPIData } from '@stex-react/api';
import { fileLocToString } from '@stex-react/utils';
import { useEffect, useReducer, useState } from 'react';
import { DocFragDisplayStatus, DocFragManager } from './DocFragManager';
import { mmtHTMLToReact } from './mmtParser';

function getStatus(
  node: SectionsAPIData,
  docFragDisplayStatus: Map<string, DocFragDisplayStatus>
) {
  const { archive, filepath } = node;
  if (!archive || !filepath) return undefined;
  return docFragDisplayStatus.get(fileLocToString({ archive, filepath }));
}
function statusToColor(status: DocFragDisplayStatus) {
  switch (status) {
    case DocFragDisplayStatus.NOT_LOADED:
      return 'red';
    case DocFragDisplayStatus.PLACEHOLDER:
      return 'gold';
    case DocFragDisplayStatus.TO_BE_SHOWN:
      return 'blue';
    case DocFragDisplayStatus.FETCHED:
      return 'purple';
    case DocFragDisplayStatus.RENDERED:
      return 'green';
  }
  return 'black';
}

function NodeWithStatus({
  node,
  docFragDisplayStatus,
}: {
  node: SectionsAPIData;
  docFragDisplayStatus: Map<string, DocFragDisplayStatus>;
}) {
  const status =
    getStatus(node, docFragDisplayStatus) ?? DocFragDisplayStatus.NOT_LOADED;
  const { archive, filepath } = node;

  return (
    <Box>
      {archive && filepath ? (
        <Box fontWeight="bold" color={statusToColor(status)}>
          {status}: {fileLocToString({ archive, filepath })}
        </Box>
      ) : (
        mmtHTMLToReact(node.title ?? '')
      )}
      <Box ml="10px">
        {node.children?.map((child) => (
          <NodeWithStatus
            key={child.title}
            node={child}
            docFragDisplayStatus={docFragDisplayStatus}
          />
        ))}
      </Box>
    </Box>
  );
}

export function RenderStatusTree({
  docFragManager,
}: {
  docFragManager: DocFragManager;
}) {
  const [, forceRerender] = useReducer((x) => x + 1, 0);
  const { docSections, docFragDisplayStatus } = docFragManager;
  const [time, setTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);
  if (!docSections) return null;
  return (
    <Box>
      <Button onClick={() => forceRerender()} variant="contained">
        Refresh
      </Button>
      {time%10000}
      <br />
      <NodeWithStatus
        node={docSections}
        docFragDisplayStatus={docFragDisplayStatus}
      />
    </Box>
  );
}
