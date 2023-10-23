import { Box } from '@mui/material';
import { getDefiniedaInDoc } from '@stex-react/api';
import { ServerLinksContext } from '@stex-react/stex-react-renderer';
import React, { useContext, useEffect, useState } from 'react';

const FileDebugData = ({archive,filepath}) => {
  const [definedData, setDefinedData] = useState(null);
  const { mmtUrl } = useContext(ServerLinksContext);
  useEffect(() => {
    async function fetchData() {
      const data = await getDefiniedaInDoc(mmtUrl, archive,filepath);
      setDefinedData(data);
    }
    fetchData();
  }, []);

  if (definedData == null) {
    return;
  }

  return (
    <Box>
      {definedData.map((data) => (
        <Box key={data.id}>
          {data.symbols.map((symbol:string, index:number) => (
            <span key={index}>{symbol}</span>
          ))}
        </Box>
      ))}
    </Box>
  );
};

export default FileDebugData;
