import React from 'react';
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
} from '@mui/material';
import dayjs from 'dayjs';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import QuizIcon from '@mui/icons-material/Quiz';
import SlideshowIcon from '@mui/icons-material/Slideshow';

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
}

export function CoverageTable({ entries, onEdit, onDelete }: CoverageTableProps) {
  const now = dayjs();

  const sortedEntries = [...entries].sort((a, b) => a.timestamp_ms - b.timestamp_ms);

  return (
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
                    <Typography variant="body2">{item.sectionName || <i>No Section</i>}</Typography>
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
  );
}

export default CoverageTable;
