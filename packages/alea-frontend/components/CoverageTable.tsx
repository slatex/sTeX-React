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
    useMediaQuery,
    useTheme,
  } from '@mui/material';
  import { CoverageSnap } from '@stex-react/utils';
  import dayjs from 'dayjs';
  import { Section } from '../pages/coverage-update';
  import { getSectionNameForUri } from './CoverageUpdater';
  import { getSlideNameByUri } from './SlideSelector';
  
 
  import DeleteIcon from '@mui/icons-material/Delete';
  import EditIcon from '@mui/icons-material/Edit';
  import OpenInNewIcon from '@mui/icons-material/OpenInNew';
  import QuizIcon from '@mui/icons-material/Quiz';
  import SlideshowIcon from '@mui/icons-material/Slideshow';
  
  interface CoverageTableProps {
    snaps: CoverageSnap[];
    sectionNames: Section[];
    onEdit: (index: number) => void;
    onDelete: (index: number) => void;
  }
  
  export function CoverageTable({ snaps, sectionNames, onEdit, onDelete }: CoverageTableProps) {
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  
    return (
      <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2, mb: 3 }}>
        <Table sx={{ minWidth: 650 }} size={isSmall ? 'small' : 'medium'}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.light' }}>
              <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Covered Section</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Target Section</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Clip</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Quiz</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Slide</TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {snaps.map((item, idx) => (
              <TableRow
                key={`${item.timestamp_ms}-${idx}`}
                sx={{
                  '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                  '&:hover': { backgroundColor: 'action.selected' },
                }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {dayjs(item.timestamp_ms).format('YYYY-MM-DD')}
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
                  <Tooltip
                    title={getSectionNameForUri(item.sectionName, sectionNames) || 'No Section'}
                  >
                    <Typography variant="body2">
                      {getSectionNameForUri(item.sectionName, sectionNames) || (
                        <i>No Section</i>
                      )}
                    </Typography>
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
                  <Tooltip
                    title={
                      getSectionNameForUri(item.targetSectionName, sectionNames) || 'No Target'
                    }
                  >
                    <Typography variant="body2">
                      {getSectionNameForUri(item.targetSectionName, sectionNames) || (
                        <i>No Target</i>
                      )}
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
                  {item.slideUri ? (
                    <Tooltip title={getSlideNameByUri(item.slideUri, {})}>
                      <Chip
                        icon={<SlideshowIcon />}
                        label={getSlideNameByUri(item.slideUri, {})}
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
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => onEdit(idx)}
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
                      onClick={() => onDelete(idx)}
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
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }