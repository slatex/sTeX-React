import QuizIcon from '@mui/icons-material/Quiz';
import { Button, Chip, Typography } from '@mui/material';
import { getAuthHeaders, QuizWithStatus } from '@stex-react/api';
import { CURRENT_TERM } from '@stex-react/utils';
import axios from 'axios';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const courseTerm = CURRENT_TERM;

interface Quiz {
  id: string;
  courseId: string;
  quizStartTs: number;
}

interface QuizMatch {
  timestamp_ms: number;
  quiz: Quiz | null;
}

interface CoverageEntry {
  id: string;
  timestamp_ms: number;
  isQuizScheduled: boolean;
}

interface QuizHandlerProps {
  courseId: string;
  entries: CoverageEntry[];
  currentEntry: CoverageEntry;
}

export default function QuizHandler({ courseId, entries, currentEntry }: QuizHandlerProps) {
  const [quizMatches, setQuizMatches] = useState<QuizMatch[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!courseId || !courseTerm) return;
    setLoading(true);
    axios
      .get(`/api/quiz/get-all-quizzes?courseId=${courseId}&courseTerm=${courseTerm}`, {
        headers: getAuthHeaders(),
      })
      .then((res) => {
        const allQuizzes: QuizWithStatus[] = res.data;

        const filteredQuizzes = allQuizzes.filter(
          (quiz) => quiz.courseId === courseId && quiz.courseTerm === courseTerm
        );

        const matches = entries.map((entry) => {
          const matchedQuiz = filteredQuizzes.find(
            (quiz) => Math.abs(quiz.quizStartTs - entry.timestamp_ms) < 12 * 60 * 60 * 1000
          );
          return { timestamp_ms: entry.timestamp_ms, quiz: matchedQuiz || null };
        });

        setQuizMatches(matches);
      })
      .catch((error) => {
        console.error('Error fetching quizzes:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [courseId, courseTerm]);

  const findQuizForEntry = (entry: CoverageEntry) =>
    quizMatches.find((match) => match.timestamp_ms === entry.timestamp_ms)?.quiz || null;

  const matchingQuiz = findQuizForEntry(currentEntry);

  if (loading) {
    return <Chip icon={<QuizIcon />} label="Loading..." size="small" color="info" />;
  }

  const formatQuizLink = (courseId: string, quizId: string) =>
    `/instructor-dash/${courseId}?tab=quiz-dashboard&quizId=${quizId}`;

  if (matchingQuiz) {
    return (
      <Link href={formatQuizLink(matchingQuiz.courseId, matchingQuiz.id)} passHref>
        <Button
          variant="contained"
          size="small"
          color="primary"
          startIcon={<QuizIcon />}
          sx={{ textTransform: 'none' }}
          component="a"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open Quiz
        </Button>
      </Link>
    );
  }

  if (currentEntry.isQuizScheduled) {
    return <Chip icon={<QuizIcon />} label="Scheduled" size="small" color="warning" />;
  }

  return (
    <Typography variant="body2" color="text.secondary">
      <i>No Quiz</i>
    </Typography>
  );
}
