import { NextPage } from 'next';
import MainLayout from '../../layouts/MainLayout';
import { UserAnonData, getAuthHeaders } from '@stex-react/api';
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Checkbox,
  CircularProgress,
  FormControlLabel,
} from '@mui/material';
import Chart from 'react-google-charts';
import { mmtHTMLToReact } from '@stex-react/stex-react-renderer';

const DiligenceAndPerformance: NextPage = () => {
  const [userAnonData, setUserAnonData] = useState<UserAnonData | null>(null);
  const [skipZeroTimes, setSkipZeroTimes] = useState(false);

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
      <FormControlLabel
        control={
          <Checkbox
            checked={skipZeroTimes}
            onChange={(e) => setSkipZeroTimes(e.target.checked)}
          />
        }
        label="Skip Zero Times"
      />
      {userAnonData.quizzes
        .sort((a, b) => a.quizStartTs - b.quizStartTs)
        .map((quiz) => (
          <Box key={quiz.id}>
            Quiz: {mmtHTMLToReact(quiz.title)}
            <Chart
              chartType="ScatterChart"
              width="100%"
              height="400px"
              data={[
                ['Visit Time (hr)', 'Score'],
                ...Object.values(userAnonData.userData)
                  .map((userInfo) => {
                    const quizData = userInfo.quizInfo?.[quiz.id];
                    if (quizData?.quizScore === undefined) return undefined;
                    if (!quizData.visitTime_sec && skipZeroTimes)
                      return undefined;
                    const visitTime_hr = quizData.visitTime_sec / 3600;
                    return [visitTime_hr, quizData.quizScore ?? 0];
                  })
                  .filter((x) => !!x),
              ]}
            />
          </Box>
        ))}
    </MainLayout>
  );
};

export default DiligenceAndPerformance;
