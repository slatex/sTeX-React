import React, { useContext, useEffect, useState } from 'react';
import { mmtHTMLToReact, ServerLinksContext } from '@stex-react/stex-react-renderer';
import { Box, Button, Typography } from '@mui/material';
import { getLearningObjectShtml } from '@stex-react/api';

const ExamplesViewer = ({ uris }) => {
  const [exampleIdx, setExampleIdx] = useState(0);
  const [example, setExample] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { mmtUrl } = useContext(ServerLinksContext);

  const fetchExample = async (uri) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getLearningObjectShtml(mmtUrl, uri);
      setExample(response);
    } catch (err) {
      setError(err.message || 'Failed to fetch example.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (uris && uris.length > 0) {
      fetchExample(uris[exampleIdx]);
    }
  }, [exampleIdx, uris]);

  const handlePrev = () => {
    if (exampleIdx > 0) {
      setExampleIdx(exampleIdx - 1);
    }
  };

  const handleNext = () => {
    if (exampleIdx < uris.length - 1) {
      setExampleIdx(exampleIdx + 1);
    }
  };

  if (!uris || uris.length === 0) {
    return <Typography>No examples available.</Typography>;
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ marginBottom: 2 }}
      >
        <Typography variant="h6">
          Example {exampleIdx + 1} of {uris.length}
        </Typography>
      </Box>
      <Box
        sx={{ padding: 2, border: '1px solid #ccc', borderRadius: 4, backgroundColor: '#f9f9f9' }}
      >
        {loading ? (
          <Typography>Loading...</Typography>
        ) : error ? (
          <Typography color="error">Error: {error}</Typography>
        ) : example ? (
          mmtHTMLToReact(example)
        ) : (
          <Typography>No example found.</Typography>
        )}
      </Box>
      <Box display="flex" justifyContent="space-between" sx={{ marginTop: 2 }}>
        <Button variant="contained" disabled={exampleIdx === 0} onClick={handlePrev}>
          Previous
        </Button>
        <Button variant="contained" disabled={exampleIdx === uris.length - 1} onClick={handleNext}>
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default ExamplesViewer;
