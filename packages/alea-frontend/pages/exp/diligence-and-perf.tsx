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
      {userAnonData.quizIds.map((quizId) => (
        <Chart
          key={quizId}
          chartType="ScatterChart"
          width="100%"
          height="400px"
          data={[
            ['Visit Time (hr)', 'Score'],
            ...Object.values(userAnonData.userData)
              .map((userInfo) => {
                const quizData = userInfo.quizInfo?.[quizId];
                if (!quizData) return undefined;
                const visitTime_hr = (quizData?.visitTime_sec ?? 0) / 3600;
                return [visitTime_hr, quizData.quizScore ?? 0];
              })
              .filter((x) => !!x),
          ]}
        />
      ))}
    </MainLayout>
  );
};

export default DiligenceAndPerformance;
