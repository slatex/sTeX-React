import { useState, useEffect } from 'react';
import RenderCompetencyData from './RenderCompetencyData';
import { getUriWeights } from '@stex-react/api';

const LearnerCompetencyData = ({ symbolArray }: { symbolArray: string[] }) => {
  const [competencyData, setCompetencyData] = useState(null);
  useEffect(() => {
    async function getData() {
      const data = await getUriWeights(symbolArray);
      setCompetencyData(data);
    }
    getData();
  }, [symbolArray]);
  return (
    <>
      <RenderCompetencyData
        URIs={symbolArray}
        competencyData={competencyData}
      />
    </>
  );
};

export default LearnerCompetencyData;
