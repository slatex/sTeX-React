import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  IconButton,
} from '@mui/material';
import {
  ContentFromUrl,
  ContentWithHighlight,
} from '@stex-react/stex-react-renderer';
import { BG_COLOR, getChildrenOfBodyNode } from '@stex-react/utils';
import { useEffect, useState } from 'react';

function DrillCard({
  uri,
  htmlNode,
  debug,
}: {
  uri: string;
  htmlNode: string;
  debug: boolean;
}) {
  const [isRevealed, setIsRevealed] = useState(false);
  useEffect(() => {
    setIsRevealed(false);
  }, [uri]);

  return (
    <Card>
      <CardContent
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: BG_COLOR,
          minHeight: '200px',
        }}
      >
        <Box>
          <Box
            display={isRevealed || debug ? undefined : 'none'}
            sx={{ '& *': { fontSize: 'large !important' } }}
          >
            <ContentFromUrl
              url={`/:sTeX/fragment?${uri}`}
              modifyRendered={getChildrenOfBodyNode}
            />
          </Box>
          {(!isRevealed || debug) && (
            <Box sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  width: 'max-content',
                  '& *': { fontSize: 'large !important' },
                }}
              >
                {debug && (
                  <>
                    <br />
                    <i>({uri})</i>
                  </>
                )}
                <ContentWithHighlight mmtHtml={htmlNode} />
              </Box>
              <br />
              {!debug && (
                <Button
                  onClick={() => setIsRevealed(true)}
                  size="small"
                  variant="contained"
                >
                  Show me!
                </Button>
              )}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export function DrillCards({
  drillItems,
}: {
  drillItems: { uri: string; htmlNode: string }[];
}) {
  const [cardNo, setCardNo] = useState(0);
  const [debug, setDebug] = useState(false);

  return (
    <Box m="5px">
      <Box sx={{ float: 'right', m: '10px 20px', color: '#333' }}>
        <b style={{ fontSize: '18px' }}>
          {cardNo + 1} of {drillItems.length}
        </b>
        {'  '}Debug
        <Checkbox
          checked={debug}
          onChange={(e) => setDebug(e.target.checked)}
          size="small"
          sx={{ p: '0' }}
        />{' '}
      </Box>
      <Box m="10px auto" width="fit-content">
        <IconButton
          onClick={() =>
            setCardNo(
              (prev) => (prev + drillItems.length - 1) % drillItems.length
            )
          }
        >
          <NavigateBeforeIcon />
        </IconButton>
        <IconButton
          onClick={() => setCardNo((prev) => (prev + 1) % drillItems.length)}
        >
          <NavigateNextIcon />
        </IconButton>
      </Box>
      <DrillCard
        uri={drillItems[cardNo].uri}
        htmlNode={drillItems[cardNo].htmlNode}
        debug={debug}
      />
    </Box>
  );
}
