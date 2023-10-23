import { Box } from '@mui/material';
import { getDefiniedaInDoc } from '@stex-react/api';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';
import React, { useContext, useEffect, useState } from 'react';
import LearnerCompetencyData from './LearnerCompetencyData';

const FileDebugData = ({ archive, filepath }) => {
  const [definedData, setDefinedData] = useState(null);
  const { mmtUrl } = useContext(ServerLinksContext);
  useEffect(() => {
    async function fetchData() {
      const data = await getDefiniedaInDoc(mmtUrl, archive, filepath);
      setDefinedData(data);
    }
    fetchData();
  }, []);

  if (definedData == null) {
    return;
  }
  const symbolArray = definedData.flatMap((data) => data.symbols);
  console.log(symbolArray);

  return (
    <Box display="flex" m="10px" p="5px" boxShadow="5px 5px 5px 5px gray">
      <Box marginRight="5px">
        {symbolArray.length ? (
          <h4 style={{ textAlign: 'center' }}>URI</h4>
        ) : (
          <></>
        )}
        {definedData.map((data) => (
          <Box key={data.id} m="2px">
            {data.symbols.map((symbol: string, index: number) => (
              <span key={index}>{symbol}</span>
            ))}
          </Box>
        ))}
      </Box>
      <Box paddingTop="40px">
        {symbolArray.length ? (
          <LearnerCompetencyData symbolArray={symbolArray} />
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
