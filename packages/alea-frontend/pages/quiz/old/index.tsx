import { Box, MenuItem, Select } from '@mui/material';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import MainLayout from '../../../layouts/MainLayout';

const LOCATIONS = [
  'Choose Quiz',
  'MAAI (may)',
  'problems/gdp',
  'MAAI (may) - small',
  'MiKoMH/AI/csp/quiz',
  'problems/maai-test/AuD/prob',
  'problems/maai-test/db/prob',
  'problems/maai-test/logic/prob',
  'problems/maai-test/math/prob',
  'problems/maai-test/mathliteracy/prob',
  'problems/maai-test/programming/prob',
  'problems/maai-test/security/prob',
  'problems/maai-test/theoinf/prob',
];
const QuizPage: NextPage = () => {
  const router = useRouter();
  return (
    <MainLayout title="Quizzes | VoLL-KI">
      <Box m="auto" maxWidth="800px" p="10px">
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          label="Age"
          value={LOCATIONS[0]}
          onChange={(e) => {
            const quizId = e.target.value as string;
            if (!quizId || quizId === LOCATIONS[0]) return;
            router.push(`/quiz/old/${encodeURIComponent(e.target.value as string)}`);
          }}
        >
          {LOCATIONS.map((location) => (
            <MenuItem key={location} value={location}>
              {location.startsWith('problems/maai-test')
                ? `MAAI (${location.slice(19, -5)})`
                : location}
            </MenuItem>
          ))}
        </Select>
      </Box>
    </MainLayout>
  );
};

export default QuizPage;
