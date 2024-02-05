import { useState, useEffect } from 'react';
import { getUriWeightsV2 } from '@stex-react/api';
import { CompetencyTable } from '@stex-react/stex-react-renderer';

const LearnerCompetencyData = ({ URIs }: { URIs: string[] }) => {
  const [competencyData, setCompetencyData] = useState(null);
  useEffect(() => {
    async function getData() {
      const data = await getUriWeightsV2(URIs);
      setCompetencyData(data);
    }
    getData();
  }, [URIs]);
  return <CompetencyTable URIs={URIs} competencyData={competencyData} />;
};

export default LearnerCompetencyData;
