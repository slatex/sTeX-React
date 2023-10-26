import { useState, useEffect } from 'react';
import RenderCompetencyData from './RenderCompetencyData';
import { getUriWeights } from '@stex-react/api';

const LearnerCompetencyData = ({ URIs }: { URIs: string[] }) => {
  const [competencyData, setCompetencyData] = useState(null);
  useEffect(() => {
    async function getData() {
      const data = await getUriWeights(URIs);
      setCompetencyData(data);
    }
    getData();
  }, [URIs]);
  return <RenderCompetencyData URIs={URIs} competencyData={competencyData} />;
};

export default LearnerCompetencyData;
