import {
  Box,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Typography,
} from '@mui/material';
import { UserAnonData, getAuthHeaders } from '@stex-react/api';
import { mmtHTMLToReact } from '@stex-react/stex-react-renderer';
import axios from 'axios';
import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import Chart from 'react-google-charts';
import MainLayout from '../../layouts/MainLayout';

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
      <Box maxWidth="700px" px="10px" m="0 auto">
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
              <Typography variant="h6">
                {mmtHTMLToReact(quiz.title)} ({quiz.id})
              </Typography>
              <Chart
                chartType="ScatterChart"
                width="100%"
                height="400px"
                options={{
                  tooltip: {},
                  hAxis: { title: 'Visit Time (hr)' },
                  vAxis: { title: 'Score' },
                  legend: 'none',
                }}
                data={[
                  ['Visit Time (hr)', 'Time, Score'],
                  ...Object.values(userAnonData.userData)
                    .map((userInfo) => {
                      const quizData = userInfo.quizInfo?.[quiz.id];
                      if (quizData?.quizScore === undefined) return undefined;
                      const visitTime_hr = (quizData.visitTime_sec ?? 0) / 3600;
                      if (!visitTime_hr && skipZeroTimes) return undefined;
                      return [visitTime_hr, quizData.quizScore];
                    })
                    .filter((x) => !!x),
                ]}
              />
            </Box>
          ))}

        <Typography variant="h6">Combined</Typography>
        <Chart
          chartType="ScatterChart"
          width="100%"
          height="400px"
          options={{
            tooltip: {},
            hAxis: { title: 'Visit Time (hr)' },
            vAxis: { title: 'Score' },
            legend: 'none',
          }}
          data={[
            ['Visit Time (hr)', 'Time, Score'],
            ...Object.values(userAnonData.userData)
              .map((userInfo) => {
                if (!userInfo.quizInfo) return undefined;
                const score = Object.values(userInfo.quizInfo).reduce(
                  (a, q) => a + (q.quizScore ?? 0),
                  0
                );
                if (!score) return undefined;
                const visitTime_hr =
                  Object.values(userInfo.quizInfo).reduce(
                    (a, q) => a + (q.visitTime_sec ?? 0),
                    0
                  ) / 3600;
                return [visitTime_hr, score];
              })
              .filter((x) => !!x),
          ]}
        />
      </Box>
    </MainLayout>
  );
};

export default DiligenceAndPerformance;
