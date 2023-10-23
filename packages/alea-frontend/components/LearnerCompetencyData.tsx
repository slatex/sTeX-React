import { Box } from '@mui/material';
import { getUriWeights } from '@stex-react/api';
import { useEffect, useState } from 'react';

const LearnerCompetencyData = ({ symbolArray }) => {
  const [competencyData, setCompetencyData] = useState(null);
  useEffect(() => {
    async function getData() {
      const data = await getUriWeights(symbolArray);
      setCompetencyData(data);
      console.log(data);
    }
    getData();
  }, []);
  return (
    <Box>
      {competencyData && competencyData.length > 0 ? (
        <table style={{ textAlign: 'center' }}>
          <thead>
            <tr>
              {Object.keys(competencyData[0]).map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {competencyData.map((row, index) => (
              <tr key={index}>
                {Object.values(row).map((value, colIndex) => (
                  <td key={colIndex}>{JSON.stringify(value)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Loading data...</p>
      )}
    </Box>
  );
};

export default LearnerCompetencyData;
