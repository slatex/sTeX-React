import { NextPage } from 'next';
import MainLayout from '../../layouts/MainLayout';
import { UserAnonData, getAuthHeaders } from '@stex-react/api';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { CircularProgress } from '@mui/material';
import Chart from 'react-google-charts';

const DiligenceAndPerformance: NextPage = () => {
  const [userAnonData, setUserAnonData] = useState<UserAnonData | null>(null);
  useEffect(() => {
    axios
      .get('/api/user-anon-data', {
        headers: getAuthHeaders(),
      })
      .then((res) => {
        setUserAnonData(res.data);
      });
  }, []);
  if (!userAnonData) return <CircularProgress />;
  return (
    <MainLayout title="Experiments | VoLL-KI">
      <Chart
        chartType="ScatterChart"
        data={[
          ['Visit Time', 'Score'],
          ...Object.values(userAnonData.userData).map(
            ({ visitTime_sec, quizScores }) => [
              visitTime_sec,
              Object.values(quizScores).reduce((s, a) => s + a, 0),
            ]
          ),
        ]}
      />
    </MainLayout>
  );
};

export default DiligenceAndPerformance;
