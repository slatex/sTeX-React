import { FTMLFragment } from '@kwarc/ftml-react';
import { FTML } from '@kwarc/ftml-viewer';
import { InsertLink, LinkOff } from '@mui/icons-material';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import MovieIcon from '@mui/icons-material/Movie';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import {
  Badge,
  Box,
  IconButton,
  LinearProgress,
  Popover,
  Tooltip,
  Typography,
} from '@mui/material';
import { ClipInfo, getSlides, Slide, SlideType } from '@stex-react/api';
import { ExpandableContextMenu } from '@stex-react/stex-react-renderer';
import { useRouter } from 'next/router';
import { Dispatch, memo, SetStateAction, useEffect, useState } from 'react';
import { setSlideNumAndSectionId } from '../pages/course-view/[courseId]';

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
      <IconButton onClick={handleOpen} color="primary" sx={{ mr: '5px' }}>
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

function SlideRenderer({ slide }: { slide: Slide }) {
  if (!slide) return <>No slide</>;
  if (slide.slideType === SlideType.FRAME) {
    return (
      <Box fragment-uri={slide.slide?.uri} fragment-kind="Slide">
        <FTMLFragment
          key={slide.slide?.uri}
          fragment={{ type: 'HtmlString', html: slide.slide?.html }}
        />
      </Box>
    );
  } else if (slide.slideType === SlideType.TEXT) {
    return (
      <Box className={styles['text-frame']}>
        {slide.paragraphs?.map((p, idx) => (
          <Box key={p.uri} fragment-uri={p.uri} fragment-kind="Paragraph">
            <FTMLFragment key={p.uri} fragment={{ type: 'HtmlString', html: p.html }} />
            {idx < slide.paragraphs.length - 1 && <br />}
          </Box>
        ))}
      </Box>
    );
  }
}

export function getSlideUri(slide: Slide) {
  if (!slide) return undefined;
  if (slide.slideType === SlideType.FRAME) {
    return slide.slide?.uri;
  } else if (slide.slideType === SlideType.TEXT) {
    return slide.paragraphs?.[0]?.uri;
  }
}

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
  audioOnly,
  videoLoaded,
}: {
  courseId: string;
  sectionId: string;
  navOnTop?: boolean;
  slideNum?: number;
  slidesClipInfo?: {
    [sectionId: string]: {
      [slideUri: string]: ClipInfo[];
    };
  };
  topLevelDocUrl?: string;
  onSlideChange?: (slide: Slide) => void;
  goToNextSection?: () => void;
  goToPrevSection?: () => void;
  onClipChange?: (clip: any) => void;
  autoSync?: boolean;
  setAutoSync?: Dispatch<SetStateAction<boolean>>;
  audioOnly?: boolean;
  videoLoaded?: boolean;
}) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [css, setCss] = useState<FTML.CSS[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedSectionId, setLoadedSectionId] = useState('');
  const [currentSlide, setCurrentSlide] = useState(undefined as Slide | undefined);
  const router = useRouter();

  useEffect(() => {
    (css ?? []).forEach((cssItem) => {
      FTML.injectCss(cssItem);
    });
  }, [css]);

  useEffect(() => {
    let isCancelled = false;
    if (!courseId?.length || !sectionId?.length) return;
    setIsLoading(true);
    setSlides([]);
    const loadingSectionId = sectionId;
    getSlides(courseId, sectionId).then((result) => {
      if (isCancelled) return;
      setIsLoading(false);
      if (Array.isArray(result)) {
        setSlides(result);
      } else if (result && Array.isArray(result.slides)) {
        setSlides(result.slides);
        if (result.css) setCss(result.css);
      }
      setLoadedSectionId(loadingSectionId);
    });
    return () => {
      isCancelled = true; // avoids race condition on rapid deckId changes.
    };
  }, [courseId, sectionId]);

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
    onSlideChange?.(selectedSlide);
  }, [sectionId, loadedSectionId, slides, slideNum, router, slidesClipInfo]);

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
        [slideUri: string]: ClipInfo[];
      };
    },
    sectionId: string,
    slideUri: string
  ) {
    if (!slidesClipInfo || !slidesClipInfo[sectionId] || !slidesClipInfo[sectionId][slideUri])
      return [];

    return (slidesClipInfo[sectionId]?.[slideUri] || []).map((item, index) => {
      return {
        id: (index + 1).toString(),
        video_id: item.video_id,
        title: `Clip no. ${index + 1}  || VideoId : ${item.video_id}`,
        thumbnail: 'https://courses.voll-ki.fau.de/fau_kwarc.png',
        start_time: item.start_time,
        end_time: item.end_time,
        duration: `${formatDuration(
          (item.end_time ?? 0) - (item.start_time ?? 0)
        )} (${formatDuration(item.start_time ?? 0)} → ${formatDuration(item.end_time ?? 0)})`,
      };
    });
  }

  const clips = getClipsFromVideoData(slidesClipInfo, sectionId, getSlideUri(currentSlide));

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
      mt={navOnTop ? '-55px' : '0px'}
    >
      <Box sx={{ position: 'absolute', right: '20px' }}>
        <ExpandableContextMenu uri={getSlideUri(currentSlide)} />
      </Box>
      {slides.length ? (
        // TODO ALEA4-S2 hack: Without border box, the content spills out of the container.
        <Box id="slide-renderer-container" sx={{ '& *': { boxSizing: 'border-box' } }}>
          <SlideRenderer key={slideNum} slide={currentSlide} />
        </Box>
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
      <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
        <Box flex={1} />
        {!audioOnly && slides.length > 0 && videoLoaded && (
          <Box>
            <Tooltip title={autoSync ? 'Disable video-slide sync' : 'Sync video to slides'}>
              <IconButton
                onClick={() => setAutoSync((prev) => !prev)}
                sx={{
                  backgroundColor: autoSync ? '#dfdfeb' : 'inherit',
                  color: autoSync ? 'success.main' : 'secondary.main',
                  mt: '-10px',
                }}
              >
                {autoSync ? (
                  <InsertLink sx={{ fontSize: '1.5rem', transform: 'rotate(90deg)' }} />
                ) : (
                  <LinkOff sx={{ fontSize: '1.5rem', transform: 'rotate(90deg)' }} />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        )}

        <Box display="flex" justifyContent="flex-end" flex={1}>
          {!audioOnly && slides.length > 0 && videoLoaded && clips.length > 0 && (
            <ClipSelector clips={clips} onClipChange={onClipChange} />
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
    </Box>
  );
});
