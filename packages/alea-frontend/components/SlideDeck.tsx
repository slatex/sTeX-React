import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Box, IconButton, LinearProgress } from '@mui/material';
import { Slide } from '@stex-react/api';
import {
  ContentWithHighlight,
  DocumentWidthSetter,
  ExpandableContextMenu,
} from '@stex-react/stex-react-renderer';
import axios from 'axios';
import { useRouter } from 'next/router';
import { memo, useEffect, useRef, useState } from 'react';
import { setSlideNumAndSectionId } from '../pages/course-view/[courseId]';
import styles from '../styles/slide-deck.module.scss';

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

export const SlideDeck = memo(function SlidesFromUrl({
  courseId,
  sectionId,
  navOnTop = false,
  slideNum = 1,
  onSlideChange,
  goToNextSection = undefined,
  goToPrevSection = undefined,
}: {
  courseId: string;
  sectionId: string;
  navOnTop?: boolean;
  slideNum?: number;
  onSlideChange?: (slide: Slide) => void;
  goToNextSection?: () => void;
  goToPrevSection?: () => void;
}) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedSectionId, setLoadedSectionId] = useState('');
  const [currentSlide, setCurrentSlide] = useState(
    undefined as Slide | undefined
  );
  const router = useRouter();
  const outerBox = useRef<HTMLDivElement>(null);

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
  const contentUrl = `archive=${currentSlide?.archive}&filepath=${currentSlide?.filepath}`;

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
            mmtHtml={currentSlide?.slideContent || ''}
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
      <SlideNavBar
        slideNum={slideNum}
        numSlides={slides.length}
        goToNextSection={goToNextSection}
        goToPrevSection={goToPrevSection}
      />
    </Box>
  );
});
