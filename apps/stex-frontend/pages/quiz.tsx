import { Box, MenuItem, Select } from '@mui/material';
import type { NextPage } from 'next';
import { useState } from 'react';
import { QuizDisplay } from '../components/QuizDisplay';
import MainLayout from '../layouts/MainLayout';

const QuizPage: NextPage = () => {
  const [path, setPath] = useState('problems/IWGS/digdocs/quiz');
  return (
    <MainLayout title="Quizzes | VoLL-KI">
      <Box mx="10px">
        <Box m="auto" maxWidth="520px">
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={path}
            label="Age"
            onChange={(e) => setPath(e.target.value)}
          >
            <MenuItem value={'problems/IWGS/digdocs/quiz'}>
              {'problems/IWGS/digdocs/quiz'}
            </MenuItem>
            <MenuItem value={'problems/IWGS/progintro/quiz'}>
              {'problems/IWGS/progintro/quiz'}
            </MenuItem>
          </Select>
          <QuizDisplay path={path} />
        </Box>
      </Box>
    </MainLayout>
  );
};

export default QuizPage;
