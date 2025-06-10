import { OpenInNew } from '@mui/icons-material';
import QuizIcon from '@mui/icons-material/Quiz';
import { Box, Button, Chip, Typography } from '@mui/material';
import { QuizWithStatus } from '@stex-react/api';
import { convertHtmlStringToPlain, LectureEntry } from '@stex-react/utils';
import Link from 'next/link';

interface QuizHandlerProps {
  currentEntry: LectureEntry;
  quiz: QuizWithStatus | null;
}

export default function QuizHandler({ currentEntry, quiz }: QuizHandlerProps) {
  const formatQuizLink = (courseId: string, quizId: string) =>
    `/instructor-dash/${courseId}?tab=quiz-dashboard&quizId=${quizId}`;

  if (quiz) {
    return (
      <Link href={formatQuizLink(quiz.courseId, quiz.id)} passHref>
        <Button
          variant="contained"
          size="small"
          color="primary"
          endIcon={<OpenInNew />}
          sx={{ textTransform: 'none' }}
          component="a"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Box
            sx={{
              textTransform: 'none',
              maxWidth: '50px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {convertHtmlStringToPlain(quiz.title)}
          </Box>
        </Button>
      </Link>
    );
  }

  if (currentEntry.isQuizScheduled) {
    return <Chip icon={<QuizIcon />} label="Scheduled" size="small" color="warning" />;
  }

  return (
    <Typography variant="body2" color="text.secondary">
      <i>-</i>
    </Typography>
  );
}
