import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Box, IconButton, LinearProgress } from '@mui/material';
import {
  ContentWithHighlight,
  ExpandableContextMenu,
} from '@stex-react/stex-react-renderer';
import axios from 'axios';
import { useRouter } from 'next/router';
import { memo, useEffect, useState } from 'react';
import { setSlideNumAndDeckId } from '../pages/course-view/[courseId]';
import { Slide } from '../shared/types';
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
            setSlideNumAndDeckId(router, slideNum - 1);
          } else {
            goToPrevSection();
          }
        }}
      >
        {slideNum == 1 ? <FirstPageIcon /> : <NavigateBeforeIcon />}
      </IconButton>
      <span style={{ fontSize: '18px' }}>
        {slideNum} / {numSlides}
      </span>
      <IconButton
        onClick={() => {
          if (slideNum < numSlides) {
            setSlideNumAndDeckId(router, slideNum + 1);
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
  deckStartNodeId,
  deckEndNodeId,
  navOnTop = false,
  slideNum = 1,
  onSlideChange,
  goToNextSection = undefined,
  goToPrevSection = undefined,
}: {
  courseId: string;
  deckStartNodeId: string;
  deckEndNodeId: string;
  navOnTop?: boolean;
  slideNum?: number;
  onSlideChange?: (slide: Slide) => void;
  goToNextSection?: () => void;
  goToPrevSection?: () => void;
}) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedSlideDeck, setLoadedSlideDeck] = useState('');
  const [currentSlide, setCurrentSlide] = useState(
    undefined as Slide | undefined
  );
  const router = useRouter();
  console.log(`[${deckStartNodeId}]-[${deckEndNodeId}]`);

  useEffect(() => {
    let isCancelled = false;
    if (!deckStartNodeId?.length || !deckEndNodeId?.length) return;
    setIsLoading(true);
    setSlides([]);
    const loadingDeck = deckStartNodeId;
    axios
      .get(
        `/api/get-slides/${courseId}/${encodeURIComponent(
          loadingDeck
        )}/${encodeURIComponent(deckEndNodeId)}`
      )
      .then((r) => {
        if (isCancelled) return;
        const slides: Slide[] = r.data || [];

        setIsLoading(false);
        setSlides(slides);
        setLoadedSlideDeck(loadingDeck);
      });

    return () => {
      isCancelled = true; // avoids race condition on rapid deckId changes.
    };
  }, [courseId, deckStartNodeId, deckEndNodeId]);
  const contentUrl = `archive=${currentSlide?.archive}&filepath=${currentSlide?.filepath}`;

  useEffect(() => {
    if (!slides?.length || loadedSlideDeck !== deckStartNodeId) return;
    if (slideNum < 1) {
      setSlideNumAndDeckId(router, slides.length);
      return;
    }
    if (slideNum > slides.length) {
      setSlideNumAndDeckId(router, 1);
      return;
    }
    const selectedSlide = slides[slideNum - 1];
    setCurrentSlide(selectedSlide);
    if (onSlideChange) onSlideChange(selectedSlide);
  }, [
    deckStartNodeId,
    loadedSlideDeck,
    slides,
    slideNum,
    router,
    onSlideChange,
  ]);

  if (isLoading) {
    return (
      <Box height="614px">
        <span style={{ fontSize: 'smaller' }}>{deckStartNodeId}</span>
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
      <ContentWithHighlight
        mmtHtml={currentSlide?.slideContent || ''}
        renderWrapperParams={{ 'section-url': deckStartNodeId }}
      />
      <SlideNavBar
        slideNum={slideNum}
        numSlides={slides.length}
        goToNextSection={goToNextSection}
        goToPrevSection={goToPrevSection}
      />
    </Box>
  );
});
