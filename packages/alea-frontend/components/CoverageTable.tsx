import { FTML } from '@kwarc/ftml-viewer';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { getAllQuizzes, QuizWithStatus } from '@stex-react/api';
import { CURRENT_TERM, LectureEntry } from '@stex-react/utils';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { SecInfo } from '../types';
import QuizHandler from './QuizHandler';

interface QuizMatchMap {
  [timestamp_ms: number]: QuizWithStatus | null;
}

interface CoverageRowProps {
  item: LectureEntry;
  quizMatch: QuizWithStatus | null;
  originalIndex: number;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  secInfo: Record<FTML.DocumentURI, SecInfo>;
}

const formatSectionWithSlide = (sectionName: string, slideNumber?: number, slideUri?: string) => {
  if (!sectionName) return <i>-</i>;

  if (!slideUri) return <Typography variant="body2">{sectionName.trim()}</Typography>;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <SlideshowIcon sx={{ fontSize: 16, color: 'success.main' }} />
      <Typography variant="body2">
        <strong>Slide {slideNumber}</strong> of {sectionName.trim()}
      </Typography>
    </Box>
  );
};

function CoverageRow({
  item,
  quizMatch,
  originalIndex,
  onEdit,
  onDelete,
  secInfo,
}: CoverageRowProps) {
  const now = dayjs();
  const itemDate = dayjs(item.timestamp_ms);
  const isPast = itemDate.isBefore(now, 'day');
  const isFuture = itemDate.isAfter(now, 'day');
  const isToday = itemDate.isSame(now, 'day');
  const isNoSection = !item.sectionUri;
  const shouldHighlightNoSection = isNoSection && (isPast || isToday);

  let backgroundColor = 'inherit';
  let hoverBackgroundColor = 'action.hover';
  if (shouldHighlightNoSection) {
    backgroundColor = 'rgba(244, 67, 54, 0.15)';
    hoverBackgroundColor = 'rgba(244, 67, 54, 0.20)';
  } else if (isPast) {
    backgroundColor = 'rgba(237, 247, 237, 0.5)';
    hoverBackgroundColor = 'rgba(237, 247, 237, 0.7)';
  } else if (isFuture) {
    backgroundColor = 'rgba(255, 243, 224, 0.5)';
    hoverBackgroundColor = 'rgba(255, 243, 224, 0.7)';
  }

  const sectionTitle = secInfo[item.sectionUri]?.title;
  const targetSectionTitle = secInfo[item.targetSectionUri]?.title;

  return (
    <TableRow
      sx={{
        backgroundColor,
        '&:hover': {
          backgroundColor: hoverBackgroundColor,
        },
      }}
    >
      <TableCell>
        <Typography
          variant="body2"
          fontWeight="medium"
          sx={{
            color: isPast ? 'success.main' : isFuture ? 'warning.main' : 'text.primary',
            fontWeight: 'bold',
          }}
        >
          {itemDate.format('YYYY-MM-DD')}
        </Typography>
      </TableCell>
      <TableCell
        sx={{
          maxWidth: '250px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        <Tooltip
          title={
            secInfo[item.sectionUri]?.title ||
            (shouldHighlightNoSection ? 'No Section - Please fill this field' : 'No Section')
          }
        >
          {shouldHighlightNoSection ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  color: 'error.main',
                  fontStyle: 'italic',
                  fontWeight: 'bold',
                }}
              >
                Update pending
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'error.main',
                  animation: 'blink 1.5s infinite',
                }}
              >
                ⚠️
              </Typography>
            </Box>
          ) : (
            formatSectionWithSlide(sectionTitle, item.slideNumber, item.slideUri)
          )}
        </Tooltip>
      </TableCell>
      <TableCell
        sx={{
          maxWidth: '200px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        <Tooltip title={targetSectionTitle || item.targetSectionUri || 'No Target'}>
          <Typography variant="body2">
            {targetSectionTitle || item.targetSectionUri || <i>-</i>}
          </Typography>
        </Tooltip>
      </TableCell>
      <TableCell>
        {item.clipId?.length ? (
          <Button
            variant="outlined"
            size="small"
            href={`https://fau.tv/clip/id/${item.clipId}`}
            target="_blank"
            rel="noreferrer"
            startIcon={<OpenInNewIcon />}
            sx={{ textTransform: 'none' }}
          >
            {item.clipId}
          </Button>
        ) : (
          <Typography variant="body2" color="text.secondary">
            <i>-</i>
          </Typography>
        )}
      </TableCell>
      <TableCell>
        <QuizHandler currentEntry={item} quiz={quizMatch} />
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            color="primary"
            onClick={() => onEdit(originalIndex)}
            sx={{
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
              },
              transition: 'all 0.2s',
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete(originalIndex)}
            sx={{
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
              },
              transition: 'all 0.2s',
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </TableCell>
    </TableRow>
  );
}

interface CoverageTableProps {
  courseId: string;
  entries: LectureEntry[];
  secInfo: Record<FTML.DocumentURI, SecInfo>;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}
export function CoverageTable({
  courseId,
  entries,
  secInfo,
  onEdit,
  onDelete,
}: CoverageTableProps) {
  const sortedEntries = [...entries].sort((a, b) => a.timestamp_ms - b.timestamp_ms);
  const [quizMatchMap, setQuizMatchMap] = useState<QuizMatchMap>({});

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const allQuizzes = await getAllQuizzes(courseId, CURRENT_TERM);
        const map: QuizMatchMap = {};
        entries.forEach((entry) => {
          const match = allQuizzes.find(
            (quiz) => Math.abs(quiz.quizStartTs - entry.timestamp_ms) < 12 * 60 * 60 * 1000
          );
          map[entry.timestamp_ms] = match || null;
        });
        setQuizMatchMap(map);
      } catch (err) {
        console.error('Error fetching quizzes:', err);
      }
    }

    fetchQuizzes();
  }, [courseId]);

  return (
    <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2, mb: 3 }}>
      <style>
        {`
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0.3; }
          }
        `}
      </style>
      <Table sx={{ minWidth: 650 }} size="medium">
        <TableHead>
          <TableRow sx={{ bgcolor: 'primary.light' }}>
            <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Date</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Section Completed</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Target Section</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Clip</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Quiz</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedEntries.map((item, idx) => {
            const originalIndex = entries.findIndex(
              (entry) => entry.timestamp_ms === item.timestamp_ms
            );

            return (
              <CoverageRow
                key={`${item.timestamp_ms}-${idx}`}
                item={item}
                quizMatch={quizMatchMap[item.timestamp_ms] || null}
                originalIndex={originalIndex}
                onEdit={onEdit}
                onDelete={onDelete}
                secInfo={secInfo}
              />
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default CoverageTable;
