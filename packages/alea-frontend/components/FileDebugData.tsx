import { Box } from '@mui/material';
import { getDefiniedaInDoc } from '@stex-react/api';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';
import React, { useContext, useEffect, useState } from 'react';
import LearnerCompetencyData from './LearnerCompetencyData';

const FileDebugData = ({
  archive,
  filepath,
}: {
  archive: string;
  filepath: string;
}) => {
  const [definedData, setDefinedData] = useState(null);
  const { mmtUrl } = useContext(ServerLinksContext);
  useEffect(() => {
    async function fetchData() {
      const data = await getDefiniedaInDoc(mmtUrl, archive, filepath);
      setDefinedData(data);
    }
    fetchData();
  }, [archive, filepath, mmtUrl]);

  if (definedData == null) {
    return;
  }
  const URIs = definedData.flatMap((data) => data.symbols);
  return (
    <Box boxShadow="5px 5px 5px 5px gray">
      <Box paddingTop="40px">
        {URIs.length ? (
          <LearnerCompetencyData URIs={URIs} />
        ) : (
          <p style={{ color: 'red', font: 'bold' }}>
            Competency data is not available for the given file.
          </p>
        )}
      </Box>
    </Box>
  );
};

export default FileDebugData;
