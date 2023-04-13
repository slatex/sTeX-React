import { Box } from '@mui/material';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { QuizDisplay } from '../../components/QuizDisplay';
import MainLayout from '../../layouts/MainLayout';

const QuizPage: NextPage = () => {
  const router = useRouter();
  const quizId = router.query.quizId as string;

  return (
    <MainLayout title="Quizzes | VoLL-KI">
      <Box>
        {quizId && <QuizDisplay quizId={quizId} />}
      </Box>
    </MainLayout>
  );
};

export default QuizPage;
