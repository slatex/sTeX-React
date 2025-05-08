import {
  Box,
  Card,
  Chip,
  Divider,
  Grid,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { CoverageSnap } from '@stex-react/utils';
import dayjs from 'dayjs';
import { Section } from '../types';
import { getSectionNameForUri } from './CoverageUpdater';

import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import QuizIcon from '@mui/icons-material/Quiz';
import SectionIcon from '@mui/icons-material/MenuBook';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import TargetIcon from '@mui/icons-material/TrackChanges';

interface CoverageMobileListProps {
  snaps: CoverageSnap[];
  sectionNames: Section[];
  availableSlides: { [sectionId: string]: any[] };
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

export function CoverageMobileList({
  snaps,
  sectionNames,
  availableSlides,
  onEdit,
  onDelete,
}: CoverageMobileListProps) {
  const theme = useTheme();

  return (
    <Box>
      {snaps.map((item, index) => (
        <Card
          key={`mobile-card-${item.timestamp_ms}-${index}`}
          elevation={2}
          sx={{
            mb: 2,
            position: 'relative',
            borderLeft: `4px solid ${theme.palette.primary.main}`,
          }}
        >
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <CalendarTodayIcon sx={{ mr: 1, fontSize: 18 }} />
                {dayjs(item.timestamp_ms).format('YYYY-MM-DD')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                #{index + 1}
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Typography
                  variant="body2"
                  sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}
                >
                  <SectionIcon sx={{ mr: 1, mt: '2px', fontSize: 18, color: 'primary.main' }} />
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Covered Section:
                    </Typography>
                    <Tooltip
                      title={getSectionNameForUri(item.sectionName, sectionNames) || 'No Section'}
                    >
                      <Typography
                        variant="body2"
                        fontWeight="medium"
                        sx={{
                          maxWidth: '100%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'block',
                        }}
                      >
                        {getSectionNameForUri(item.sectionName, sectionNames) ? (
                          getSectionNameForUri(item.sectionName, sectionNames)
                        ) : (
                          <i>No Section</i>
                        )}
                      </Typography>
                    </Tooltip>
                  </Box>
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography
                  variant="body2"
                  sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}
                >
                  <TargetIcon sx={{ mr: 1, mt: '2px', fontSize: 18, color: 'secondary.main' }} />
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Target Section:
                    </Typography>
                    <Tooltip
                      title={
                        getSectionNameForUri(item.targetSectionName, sectionNames) || 'No Target'
                      }
                    >
                      <Typography
                        variant="body2"
                        fontWeight="medium"
                        sx={{
                          maxWidth: '100%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'block',
                        }}
                      >
                        {getSectionNameForUri(item.targetSectionName, sectionNames) ? (
                          getSectionNameForUri(item.targetSectionName, sectionNames)
                        ) : (
                          <i>No Target</i>
                        )}
                      </Typography>
                    </Tooltip>
                  </Box>
                </Typography>
              </Grid>

              <Grid item xs={12}>
                {item.clipId?.length ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Chip
                      label={item.clipId}
                      size="small"
                      color="info"
                      icon={<OpenInNewIcon />}
                      component="a"
                      href={`https://fau.tv/clip/id/${item.clipId}`}
                      target="_blank"
                      rel="noreferrer"
                      clickable
                    />
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    <i>No Clip ID</i>
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                {item.slideUri ? (
                  (() => {
                    for (const sectionId in availableSlides) {
                      const slide = availableSlides[sectionId]?.find(
                        (s) => s.uri === item.slideUri
                      );
                      if (slide?.title) {
                        break;
                      }
                    }
                    return (
                      <Box sx={{ mb: 1 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', mb: 0.5 }}
                        >
                          Slide:
                        </Typography>
                        <Chip
                          icon={<SlideshowIcon />}
                          label={item.slideNumber ? `Slide ${item.slideNumber}` : 'No Slide'}
                          size="small"
                          color="success"
                        />
                      </Box>
                    );
                  })()
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    <i>No Slide</i>
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                {item.isQuizScheduled ? (
                  <Chip icon={<QuizIcon />} label="Quiz Scheduled" size="small" color="warning" />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    <i>No Quiz</i>
                  </Typography>
                )}
              </Grid>
            </Grid>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              borderTop: `1px solid ${theme.palette.divider}`,
              px: 1,
              py: 0.5,
              bgcolor: 'action.hover',
            }}
          >
            <IconButton onClick={() => onEdit(index)} color="primary" size="small">
              <EditIcon />
            </IconButton>

            <IconButton onClick={() => onDelete(index)} color="error" size="small">
              <DeleteIcon />
            </IconButton>
          </Box>
        </Card>
      ))}
    </Box>
  );
}
