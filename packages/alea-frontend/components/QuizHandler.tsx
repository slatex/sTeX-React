import QuizIcon from '@mui/icons-material/Quiz';
import { Button, Chip, Typography } from '@mui/material';
import { getAuthHeaders, QuizWithStatus } from '@stex-react/api';
import { CURRENT_TERM } from '@stex-react/utils';
import axios from 'axios';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useEffect, useState } from 'react';

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
  const courseTerm = CURRENT_TERM;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  if (!courseId || !courseTerm) return;

  const scheduledEntries = entries.filter((entry) => entry.isQuizScheduled);

  if (scheduledEntries.length === 0) return;

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

      const matches = scheduledEntries.map((entry) => {
        const entryDate = dayjs(entry.timestamp_ms).format('YYYY-MM-DD');
        const matchedQuiz = filteredQuizzes.find(
          (quiz) => dayjs(quiz.quizStartTs).format('YYYY-MM-DD') === entryDate
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
}, [courseId, courseTerm, JSON.stringify(entries)]);


  const findQuizForEntry = (entry: CoverageEntry) =>
    quizMatches.find((match) => match.timestamp_ms === entry.timestamp_ms)?.quiz || null;

  const formatQuizLink = (courseId: string, quizId: string) =>
    `/instructor-dash/${courseId}?tab=quiz-dashboard&quizId=${quizId}`;

  if (!currentEntry.isQuizScheduled) {
    return (
      <Typography variant="body2" color="text.secondary">
        <i>No Quiz</i>
      </Typography>
    );
  }

  if (loading) {
    return <Chip icon={<QuizIcon />} label="Loading..." size="small" color="info" />;
  }

  const matchingQuiz = findQuizForEntry(currentEntry);

  return matchingQuiz ? (
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
  ) : (
    <Chip icon={<QuizIcon />} label="Scheduled" size="small" color="warning" />
  );
}
