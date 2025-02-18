import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import SyncLockIcon from '@mui/icons-material/SyncLock';
import { Badge, Popover, Typography } from '@mui/material';
import MovieIcon from '@mui/icons-material/Movie';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Box, IconButton, LinearProgress, Tooltip } from '@mui/material';
import { ClipInfo, Slide, SlideClipInfo, SlideType } from '@stex-react/api';
import {
  ContentWithHighlight,
  DocumentWidthSetter,
  DisplayReason,
  ExpandableContextMenu,
} from '@stex-react/stex-react-renderer';
import { XhtmlContentUrl } from '@stex-react/utils';
import axios from 'axios';
import { useRouter } from 'next/router';
import { Dispatch, memo, SetStateAction, useEffect, useState } from 'react';
import { ClipData, setSlideNumAndSectionId, ViewMode } from '../pages/course-view/[courseId]';
import styles from '../styles/slide-deck.module.scss';

export function SlideNavBar({
  slideNum,
  numSlides,
  goToNextSection = undefined,
  goToPrevSection = undefined,
  setAutoSync,
}: {
  slideNum: number;
  numSlides: number;
  goToNextSection?: () => void;
  goToPrevSection?: () => void;
  setAutoSync?: Dispatch<SetStateAction<boolean>>;
}) {
  const router = useRouter();
  return (
    <Box display="flex" justifyContent="flex-end" alignItems="center">
      <IconButton
        onClick={() => {
          setAutoSync(false);
          if (slideNum > 1) {
            setSlideNumAndSectionId(router, slideNum - 1);
          } else {
            goToPrevSection();
          }
        }}
      >
        {slideNum == 1 ? <FirstPageIcon /> : <NavigateBeforeIcon />}
      </IconButton>
      <span style={{ fontSize: '18px', marginBottom: '5px' }}>
        {numSlides === 0 ? 0 : slideNum} / {numSlides}
      </span>

      <IconButton
        onClick={() => {
          setAutoSync(false);
          if (slideNum < numSlides) {
            setSlideNumAndSectionId(router, slideNum + 1);
          } else {
            goToNextSection();
          }
        }}
      >
        {slideNum >= numSlides ? <LastPageIcon /> : <NavigateNextIcon />}
      </IconButton>
    </Box>
  );
}

interface Clip {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
}

const ClipSelector = ({
  clips,
  onClipChange,
}: {
  clips: Clip[];
  onClipChange: (clip: any) => void;
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton onClick={handleOpen} color="primary" sx={{ m: '5px' }}>
        <Badge badgeContent={clips.length} color="error">
          <MovieIcon />
        </Badge>
      </IconButton>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Box sx={{ width: 320, maxHeight: 400, overflowY: 'auto', padding: 1 }}>
          {clips.map((clip) => (
            <Box
              key={clip.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                padding: 1,
                cursor: 'pointer',
                '&:hover': { backgroundColor: '#f0f0f0' },
              }}
              onClick={() => {
                handleClose();
                onClipChange(clip);
              }}
            >
              <Box sx={{ position: 'relative', width: 100, height: 56 }}>
                <img
                  src={clip.thumbnail}
                  alt={clip.title}
                  style={{ width: '100%', height: '100%', borderRadius: 4, objectFit: 'cover' }}
                />
                <PlayArrowIcon
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    borderRadius: '50%',
                    fontSize: 20,
                    padding: '2px',
                  }}
                />
              </Box>

              <Box>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {clip.title}
                </Typography>
                <Typography variant="caption" color="gray">
                  {clip.duration}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Popover>
    </>
  );
};

export const SlideDeck = memo(function SlidesFromUrl({
  courseId,
  sectionId,
  navOnTop = false,
  slideNum = 1,
  slidesClipInfo,
  topLevelDocUrl = undefined,
  onSlideChange,
  goToNextSection = undefined,
  goToPrevSection = undefined,
  onClipChange,
  autoSync,
  setAutoSync,
}: {
  courseId: string;
  sectionId: string;
  navOnTop?: boolean;
  slideNum?: number;
  slidesClipInfo?: {
    [sectionId: string]: {
      [slideNumber: number]: ClipInfo[];
    };
  };
  topLevelDocUrl?: string;
  onSlideChange?: (slide: Slide) => void;
  goToNextSection?: () => void;
  goToPrevSection?: () => void;
  onClipChange?: (clip: any) => void;
  autoSync?: boolean;
  setAutoSync?: Dispatch<SetStateAction<boolean>>;
}) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedSectionId, setLoadedSectionId] = useState('');
  const [currentSlide, setCurrentSlide] = useState(undefined as Slide | undefined);
  const [isDebugVideo, setIsDebugVideo] = useState(false);

  useEffect(() => {
    setIsDebugVideo(localStorage.getItem('debug-video') === 'true');
  }, []);
  const router = useRouter();

  useEffect(() => {
    let isCancelled = false;
    if (!courseId?.length || !sectionId?.length) return;
    setIsLoading(true);
    setSlides([]);
    const loadingSectionId = sectionId;
    axios.get(`/api/get-slides/${courseId}/${sectionId}`).then((r) => {
      if (isCancelled) return;
      const slides: Slide[] = r.data?.[sectionId] || [];

      setIsLoading(false);
      setSlides(slides);
      setLoadedSectionId(loadingSectionId);
    });

    return () => {
      isCancelled = true; // avoids race condition on rapid deckId changes.
    };
  }, [courseId, sectionId]);
  const contentUrl = XhtmlContentUrl(currentSlide?.archive, currentSlide?.filepath);
  useEffect(() => {
    if (!slides?.length || loadedSectionId !== sectionId) return;
    if (slideNum < 1) {
      setSlideNumAndSectionId(router, slides.length);
      return;
    }
    if (slideNum > slides.length) {
      setSlideNumAndSectionId(router, 1);
      return;
    }
    const selectedSlide = slides[slideNum - 1];
    setCurrentSlide(selectedSlide);
    if (onSlideChange) onSlideChange(selectedSlide);
  }, [sectionId, loadedSectionId, slides, slideNum, router, onSlideChange]);

  function formatDuration(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.ceil(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }
  function getClipsFromVideoData(
    slidesClipInfo: {
      [sectionId: string]: {
        [slideNumber: number]: ClipInfo[];
      };
    },
    sectionId: string,
    slideIndex: number
  ) {
    if (!slidesClipInfo || !slidesClipInfo[sectionId] || !slidesClipInfo[sectionId][slideIndex])
      return [];

    return (slidesClipInfo[sectionId]?.[slideIndex] || []).map((item, index) => ({
      id: (index + 1).toString(),
      video_id: item.video_id,
      title: `Clip no. ${index + 1} of slide ${slideIndex} - ${
        item.title || 'Untitled'
      } || VideoId : ${item.video_id}`,
      thumbnail: item.thumbnail || 'https://courses.voll-ki.fau.de/fau_kwarc.png',
      start_time: item.start_time,
      end_time: item.end_time,
      duration: `${formatDuration((item.end_time ?? 0) - (item.start_time ?? 0))} (${formatDuration(
        item.start_time ?? 0
      )} → ${formatDuration(item.end_time ?? 0)})`,
    }));
  }

  const clips = getClipsFromVideoData(slidesClipInfo, sectionId, slideNum);

  if (isLoading) {
    return (
      <Box height="614px">
        <span style={{ fontSize: 'smaller' }}>
          {courseId}: {sectionId}
        </span>
        <LinearProgress />
      </Box>
    );
  }
  return (
    <Box
      className={styles['deck-box']}
      flexDirection={navOnTop ? 'column-reverse' : 'column'}
      mt={navOnTop ? '-40px' : '0px'}
    >
      <Box sx={{ position: 'absolute', right: '20px' }}>
        <ExpandableContextMenu contentUrl={contentUrl} />
      </Box>
      {slides.length ? (
        <DocumentWidthSetter>
          <ContentWithHighlight
            topLevelDocUrl={topLevelDocUrl}
            mmtHtml={currentSlide?.slideContent || ''}
            displayReason={DisplayReason.SLIDES}
            renderWrapperParams={{ 'section-url': contentUrl }}
          />
        </DocumentWidthSetter>
      ) : (
        <Box
          height="574px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="x-large"
          fontStyle="italic"
        >
          No slides in this section
        </Box>
      )}
      <Box display="flex" justifyContent="flex-end">
        {isDebugVideo && <ClipSelector clips={clips} onClipChange={onClipChange} />}
        {isDebugVideo && (
          <Tooltip title="Sync video to slides">
            <IconButton
              onClick={() => setAutoSync((prev) => !prev)}
              sx={{
                backgroundColor: autoSync ? '#dfdfeb' : 'inherit',
                color: autoSync ? 'primary.main' : 'secondary',
                mb: '5px',
              }}
            >
              <SyncLockIcon />
            </IconButton>
          </Tooltip>
        )}
        <SlideNavBar
          slideNum={slideNum}
          numSlides={slides.length}
          goToNextSection={goToNextSection}
          goToPrevSection={goToPrevSection}
          setAutoSync={setAutoSync}
        />
      </Box>
    </Box>
  );
});
