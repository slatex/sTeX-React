import {
  Box,
  Button,
  Chip,
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
  LinearProgress,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import dayjs from 'dayjs';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import QuizIcon from '@mui/icons-material/Quiz';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import SpeedIcon from '@mui/icons-material/Speed';
import { useMemo } from 'react';

interface CoverageEntry {
  id: string;
  timestamp_ms: number;
  sectionName: string;
  sectionUri: string;
  targetSectionName: string;
  targetSectionUri: string;
  clipId: string;
  isQuizScheduled: boolean;
  slideUri: string;
  slideNumber?: number;
}

interface CoverageTableProps {
  entries: CoverageEntry[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  sectionOrder?: string[];
  courseStartDate?: string;
  sectionList?: Array<{ id: string; title: string; uri: string }>;
}

function calculatePreorderFlatProgress(
  entries: CoverageEntry[] = [],
  sectionOrder: string[] = [],
  courseStartDate: string = ''
) {
  const normalize = (s: string) => s.trim().toLowerCase();
  const today = dayjs().endOf('day');
  const start = dayjs(courseStartDate);

  if (!start.isValid() || sectionOrder.length === 0) {
    return {
      status: 'on-track',
      difference: 0,
      message: 'Invalid configuration',
      overallProgress: 0,
      totalSections: sectionOrder.length,
      overallPercentage: 0,
      completedSections: [],
    };
  }

  const normalizedOrder = sectionOrder.map(normalize);

  let maxSeenIndex = -1;
  let maxTargetIndex = -1;

  for (const entry of entries) {
    const entryDate = dayjs(entry.timestamp_ms);
    if (entryDate.isAfter(today)) continue;

    const sectionNameIndex = normalizedOrder.indexOf(normalize(entry.sectionName ?? ''));
    const targetSectionIndex = normalizedOrder.indexOf(normalize(entry.targetSectionName ?? ''));

    if (sectionNameIndex !== -1) {
      maxSeenIndex = Math.max(maxSeenIndex, sectionNameIndex);
    }

    if (targetSectionIndex !== -1) {
      maxTargetIndex = Math.max(maxTargetIndex, targetSectionIndex);
    }
  }

  const difference = maxSeenIndex - maxTargetIndex;

  const status = difference > 0 ? 'ahead' : difference < 0 ? 'behind' : 'on-track';
  const message =
    difference === 0
      ? "You're on track with today's plan."
      : `You're ${Math.abs(difference)} section${Math.abs(difference) !== 1 ? 's' : ''} ${status}.`;

  return {
    status,
    difference,
    message,
    overallProgress: maxSeenIndex + 1,
    totalSections: sectionOrder.length,
    overallPercentage:
      sectionOrder.length > 0 ? ((maxSeenIndex + 1) / sectionOrder.length) * 100 : 0,
    completedSections: normalizedOrder.slice(0, maxSeenIndex + 1),
  };
}

export function CoverageTable({
  entries,
  onEdit,
  onDelete,
  sectionOrder = [],
  courseStartDate = '',
}: CoverageTableProps) {
  const now = dayjs();
  const sortedEntries = [...entries].sort((a, b) => {
    const dateA = dayjs(a.timestamp_ms).startOf('day').valueOf();
    const dateB = dayjs(b.timestamp_ms).startOf('day').valueOf();
    return dateA - dateB;
  });
  const progressData = useMemo(
    () => calculatePreorderFlatProgress(entries, sectionOrder, courseStartDate),
    [entries, sectionOrder, courseStartDate]
  );
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ahead':
        return <TrendingUpIcon />;
      case 'behind':
        return <TrendingDownIcon />;
      case 'on-track':
        return <CheckCircleIcon />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ahead':
        return 'success';
      case 'behind':
        return 'error';
      case 'on-track':
        return 'info';
      default:
        return 'warning';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return '#4caf50';
    if (percentage >= 60) return '#2196f3';
    if (percentage >= 40) return '#ff9800';
    return '#f44336';
  };

  return (
    <Box>
      <Paper
        elevation={3}
        sx={{
          mb: 3,
          borderRadius: 3,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Box sx={{ p: 2.5, color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <SpeedIcon sx={{ fontSize: 28 }} />
            <Typography variant="h6" fontWeight="600">
              Lecture Progress
            </Typography>
          </Box>

          <Grid container spacing={3} sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  bgcolor: 'rgba(255,255,255,0.95)',
                  borderRadius: 2,
                  height: 160,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <CardContent
                  sx={{
                    p: 2.5,
                    '&:last-child': { pb: 2.5 },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <ViewModuleIcon sx={{ color: '#764ba2', fontSize: 24 }} />
                    <Typography variant="h6" fontWeight="600" color="text.primary">
                      Lecture Progress
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Typography variant="h2" fontWeight="bold" sx={{ color: '#764ba2' }}>
                      {Math.round(progressData.overallPercentage)}%
                    </Typography>

                    <Box sx={{ flex: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={progressData.overallPercentage}
                        sx={{
                          height: 12,
                          borderRadius: 6,
                          bgcolor: 'rgba(0,0,0,0.1)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 6,
                            bgcolor: getProgressColor(progressData.overallPercentage),
                          },
                        }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {progressData.overallProgress} of {progressData.totalSections} lectures
                        completed
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  bgcolor: 'rgba(255,255,255,0.95)',
                  borderRadius: 2,
                  height: 160,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <CardContent
                  sx={{
                    p: 2.5,
                    '&:last-child': { pb: 2.5 },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    {getStatusIcon(progressData.status)}
                    <Typography variant="h6" fontWeight="600" color="text.primary">
                      Schedule Status
                    </Typography>
                  </Box>

                  <Typography variant="h6" fontWeight="600" color="text.primary" sx={{ mb: 1.5 }}>
                    {Math.abs(progressData.difference) < 1
                      ? `Running slightly ${
                          progressData.difference > 0
                            ? 'ahead-of'
                            : progressData.difference < 0
                            ? 'behind'
                            : 'on'
                        } schedule`
                      : `Running over ${Math.abs(progressData.difference)} lecture${
                          Math.abs(progressData.difference) !== 1 ? 's' : ''
                        } ${progressData.difference > 0 ? 'ahead-of' : 'behind'} schedule`}
                  </Typography>

                  <Chip
                    label={
                      progressData.status.charAt(0).toUpperCase() + progressData.status.slice(1)
                    }
                    color={getStatusColor(progressData.status) as any}
                    sx={{ fontWeight: 600 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2, mb: 3 }}>
        <Table sx={{ minWidth: 650 }} size="medium">
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.light' }}>
              <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Section Completed</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Slide</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Target Section</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Clip</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Quiz</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedEntries.map((item, idx) => {
              const itemDate = dayjs(item.timestamp_ms);
              const isPast = itemDate.isBefore(now, 'day');
              const isFuture = itemDate.isAfter(now, 'day');

              const originalIndex = entries.findIndex((entry) => entry.id === item.id);

              return (
                <TableRow
                  key={`${item.timestamp_ms}-${idx}`}
                  sx={{
                    backgroundColor: isPast
                      ? 'rgba(237, 247, 237, 0.5)'
                      : isFuture
                      ? 'rgba(255, 243, 224, 0.5)'
                      : 'inherit',
                    '&:hover': {
                      backgroundColor: isPast
                        ? 'rgba(237, 247, 237, 0.7)'
                        : isFuture
                        ? 'rgba(255, 243, 224, 0.7)'
                        : 'action.hover',
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
                      maxWidth: '200px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Tooltip title={item.sectionName || 'No Section'}>
                      <Typography variant="body2">
                        {item.sectionName || <i>No Section</i>}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    {item.slideUri ? (
                      <Tooltip title={item.slideNumber ? `Slide ${item.slideNumber}` : 'No Slide'}>
                        <Chip
                          icon={<SlideshowIcon />}
                          label={item.slideNumber ? `Slide ${item.slideNumber}` : 'No Slide'}
                          size="small"
                          color="success"
                        />
                      </Tooltip>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        <i>No Slide</i>
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell
                    sx={{
                      maxWidth: '200px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Tooltip title={item.targetSectionName || 'No Target'}>
                      <Typography variant="body2">
                        {item.targetSectionName || <i>No Target</i>}
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
                        <i>No Clip</i>
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.isQuizScheduled ? (
                      <Chip icon={<QuizIcon />} label="Scheduled" size="small" color="warning" />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        <i>No Quiz</i>
                      </Typography>
                    )}
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
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default CoverageTable;
