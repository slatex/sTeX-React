import React, { useContext, useEffect, useState } from 'react';
import { mmtHTMLToReact, ServerLinksContext } from '@stex-react/stex-react-renderer';
import { Box, Button, Typography } from '@mui/material';
import { getLearningObjectShtml } from '@stex-react/api';

const DefinitionsViewer = ({ uris }) => {
  const [definitionIdx, setDefinitionIdx] = useState(0);
  const [definition, setDefinition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { mmtUrl } = useContext(ServerLinksContext);

  const fetchDefinition = async (uri) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getLearningObjectShtml(mmtUrl, uri);
      setDefinition(response);
    } catch (err) {
      setError(err.message || 'Failed to fetch definition.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (uris && uris.length > 0) {
      fetchDefinition(uris[definitionIdx]);
    }
  }, [definitionIdx, uris]);

  const handlePrev = () => {
    if (definitionIdx > 0) {
      setDefinitionIdx(definitionIdx - 1);
    }
  };

  const handleNext = () => {
    if (definitionIdx < uris.length - 1) {
      setDefinitionIdx(definitionIdx + 1);
    }
  };

  if (!uris || uris.length === 0) {
    return <Typography>No definitions available.</Typography>;
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
          Definition {definitionIdx + 1} of {uris.length}
        </Typography>
      </Box>
      <Box
        sx={{ padding: 2, border: '1px solid #ccc', borderRadius: 4, backgroundColor: '#f9f9f9' }}
      >
        {loading ? (
          <Typography>Loading...</Typography>
        ) : error ? (
          <Typography color="error">Error: {error}</Typography>
        ) : definition ? (
          mmtHTMLToReact(definition)
        ) : (
          <Typography>No definition found.</Typography>
        )}
      </Box>
      <Box display="flex" justifyContent="space-between" sx={{ marginTop: 2 }}>
        <Button variant="contained" disabled={definitionIdx === 0} onClick={handlePrev}>
          Previous
        </Button>
        <Button
          variant="contained"
          disabled={definitionIdx === uris.length - 1}
          onClick={handleNext}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default DefinitionsViewer;
