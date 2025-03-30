import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { DefiniendaItem, getDefiniedaInDoc, getLearningObjects } from '@stex-react/api';
import { useContext, useEffect, useState } from 'react';
import { PracticeQuestions, ServerLinksContext } from './stex-react-renderer';

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
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(true);
  const [response, setResponse] = useState<any>(null);
  const [problemIds, setProblemIds] = useState<string[]>([]);

  const handleClick = async () => {
    setShow(false);
    setLoading(true);
    try {
      console.log('Fetching data for:', archive, filepath);
      const data = await getDefiniedaInDoc(mmtUrl, archive, filepath);
      setDefinedData(data);

      const URIs = data?.flatMap((item) => item.symbols) || [];
      console.log('URIs:', URIs);

      const fetchedResponse = await getLearningObjects(URIs, 30, ['problem']);
      setResponse(fetchedResponse);

      // Extract learning-object URLs
      const extractedProblemIds = fetchedResponse?.['learning-objects']?.map((obj: any) => obj['learning-object']) || [];
      setProblemIds(extractedProblemIds);

      console.log('Extracted Problem IDs:', extractedProblemIds);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (show) {
    return (
      <Button onClick={handleClick} variant="contained">
        For Me
      </Button>
    );
  }

  return (
    <Box p={2} bgcolor="white" border="1px solid #CCC" borderRadius="5px">
      <Typography variant="h6">For Me</Typography>
      {loading ? (
        <CircularProgress />
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
            <Typography variant="body2" color="textSecondary">
              <pre>Response: {response ? JSON.stringify(response, null, 2) : 'No response available'}</pre>
            </Typography>
          </Box>
          
          {/* Render PracticeQuestions with extracted problemIds */}
          {problemIds.length > 0 ? (
            problemIds.map((problemId, index) => (
              <PracticeQuestions key={index} problemIds={[problemId]} />
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">No Practice Questions Available</Typography>
          )}

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
