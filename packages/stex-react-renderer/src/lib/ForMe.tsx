import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { DefiniendaItem, getDefiniedaInDoc, getLearningObjects } from '@stex-react/api';
import { useContext, useEffect, useState } from 'react';
import { ServerLinksContext } from './stex-react-renderer';

export function ForMe({
  archive,
  filepath,
  showHideButton = false,
}: {
  archive: string;
  filepath: string;
  showHideButton?: boolean;
}) {
  const { mmtUrl } = useContext(ServerLinksContext);
  const [definedData, setDefinedData] = useState<DefiniendaItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(true);
  const [response, setResponse] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      console.log('kee', archive, filepath);
      const data = await getDefiniedaInDoc(mmtUrl, archive, filepath);
      setDefinedData(data);

      const URIs = data ? data.flatMap((item) => item.symbols) : [];
      console.log('URIs', URIs);

      const response = await getLearningObjects(URIs);
      const problemsOnly = response['learning-objects'].filter((obj) => obj.type == 'problem');

      console.log('Filtered Response', problemsOnly);
      setResponse(problemsOnly);

      setLoading(false);
    }
    fetchData();
  }, [archive, filepath, mmtUrl]);

  console.log('Hello', definedData);

  if (definedData == null) {
    return;
  }

  if (show) {
    return (
      <Button onClick={() => setShow(false)} variant="contained">
        For Me
      </Button>
    );
  }

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box p={2} bgcolor="white" border="1px solid #CCC" borderRadius="5px">
      <Typography variant="h6">For Me</Typography>
      {show ? (
        <Button onClick={() => setShow(false)} variant="contained">
          For Me
        </Button>
      ) : (
        <>
          <Box
            sx={{
              maxHeight: '200px',
              overflowY: 'auto',
              border: '1px solid #ddd',
              p: 1,
              mb: 1,
            }}
          >
            <ul>
              <Typography variant="body2" color="textSecondary">
                <pre>Response: {response ? JSON.stringify(response, null, 2) : 'No response available'}</pre>
              </Typography>
            </ul>
          </Box>

          {showHideButton && (
            <Button onClick={() => setShow(true)} variant="contained">
              Hide
            </Button>
          )}
        </>
      )}
    </Box>
  );
}
