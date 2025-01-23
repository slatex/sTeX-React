import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Box, IconButton, LinearProgress, Tooltip } from '@mui/material';
import { Slide, SlideClipInfo, SlideType } from '@stex-react/api';
import {
  ContentWithHighlight,
  DocumentWidthSetter,
  DisplayReason,
  ExpandableContextMenu,
} from '@stex-react/stex-react-renderer';
import { XhtmlContentUrl } from '@stex-react/utils';
import axios from 'axios';
import { useRouter } from 'next/router';
import { memo, useEffect, useState } from 'react';
import { setSlideNumAndSectionId, ViewMode } from '../pages/course-view/[courseId]';
import styles from '../styles/slide-deck.module.scss';
import { FastForward } from '@mui/icons-material';

export function SlideNavBar({
  slideNum,
  numSlides,
  goToNextSection = undefined,
  goToPrevSection = undefined,
}: {
  slideNum: number;
  numSlides: number;
  goToNextSection?: () => void;
  goToPrevSection?: () => void;
}) {
  const router = useRouter();
  return (
    <Box display="flex" justifyContent="flex-end" alignItems="center">
      <IconButton
        onClick={() => {
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
export default function SeekVideo({
  slides,
  slidesClipInfo,
  slideNum,
  setTimestampSec,
}: {
  slides: Slide[];
  slidesClipInfo: SlideClipInfo[];
  slideNum: number;
  setTimestampSec?: React.Dispatch<React.SetStateAction<number>>;
}) {
  const currentSlide = slides[slideNum - 1];
  if (!currentSlide) return;
  if (currentSlide.slideType === SlideType.TEXT) return;

  const frameSlides = slides.filter((slide) => slide.slideType === SlideType.FRAME);
  const clipInfoIndex = frameSlides.indexOf(currentSlide);
  const clipInfo =
    clipInfoIndex !== -1 &&
    slidesClipInfo &&
    clipInfoIndex >= 0 &&
    clipInfoIndex < slidesClipInfo.length
      ? slidesClipInfo[clipInfoIndex]
      : null;
  const handleSeek = () => {
    if (clipInfo) {
      setTimestampSec((prev) =>
        prev === clipInfo.startTimeSec ? prev + 0.001 : clipInfo.startTimeSec
      );
    }
  };
  return (
    <Box>
      <Tooltip title={`Seek Video to slide no. ${slideNum}`} arrow>
        <IconButton
          onClick={handleSeek}
          sx={{
            backgroundColor: '#1976d2',
            color: 'white',
            margin: '10px',
            '&:hover': {
              backgroundColor: '#1565c0',
            },
          }}
        >
          <FastForward />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

export const SlideDeck = memo(function SlidesFromUrl({
  courseId,
  sectionId,
  navOnTop = false,
  slideNum = 1,
  slidesClipInfo,
  setTimestampSec,
  topLevelDocUrl = undefined,
  onSlideChange,
  goToNextSection = undefined,
  goToPrevSection = undefined,
}: {
  courseId: string;
  sectionId: string;
  navOnTop?: boolean;
  slideNum?: number;
  slidesClipInfo?: {
    [sectionId: string]: SlideClipInfo[];
  };
  setTimestampSec?: React.Dispatch<React.SetStateAction<number>>;
  topLevelDocUrl?: string;
  onSlideChange?: (slide: Slide) => void;
  goToNextSection?: () => void;
  goToPrevSection?: () => void;
}) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedSectionId, setLoadedSectionId] = useState('');
  const [currentSlide, setCurrentSlide] = useState(undefined as Slide | undefined);
  const router = useRouter();
  const viewModeStr = router.query.viewMode as string;
  const viewMode = ViewMode[viewModeStr as keyof typeof ViewMode];
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
      {viewMode === ViewMode.COMBINED_MODE && (
        <SeekVideo
          slides={slides}
          slidesClipInfo={slidesClipInfo[sectionId]}
          slideNum={slideNum}
          setTimestampSec={setTimestampSec}
        />
      )}
      <SlideNavBar
        slideNum={slideNum}
        numSlides={slides.length}
        goToNextSection={goToNextSection}
        goToPrevSection={goToPrevSection}
      />
    </Box>
  );
});
