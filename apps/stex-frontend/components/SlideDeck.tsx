import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Box, IconButton, LinearProgress } from '@mui/material';
import { ContentWithHighlight } from '@stex-react/stex-react-renderer';
import axios from 'axios';
import { Dispatch, memo, SetStateAction, useEffect, useState } from 'react';
import { DeckAndVideoInfo, Slide } from '../shared/slides';
import styles from '../styles/slide-deck.module.scss';

export function SlideNavBar({
  slideNumber,
  setSlideNumber,
  numSlides,
  goToNextSection = undefined,
  goToPrevSection = undefined,
}: {
  slideNumber: number;
  setSlideNumber: Dispatch<SetStateAction<number>>;
  numSlides: number;
  goToNextSection?: () => void;
  goToPrevSection?: () => void;
}) {
  return (
    <Box display="flex" justifyContent="flex-end" alignItems="center">
      <IconButton
        onClick={() => {
          if (slideNumber > 0) setSlideNumber((curr) => curr - 1);
          else goToPrevSection();
        }}
      >
        {slideNumber == 0 ? <FirstPageIcon /> : <NavigateBeforeIcon />}
      </IconButton>
      <span style={{ fontSize: '18px' }}>
        {slideNumber + 1} / {numSlides}
      </span>
      <IconButton
        onClick={() => {
          if (slideNumber < numSlides - 1) setSlideNumber((curr) => curr + 1);
          else goToNextSection();
        }}
      >
        {slideNumber >= numSlides - 1 ? <LastPageIcon /> : <NavigateNextIcon />}
      </IconButton>
    </Box>
  );
}

export const SlideDeck = memo(function SlidesFromUrl({
  courseId,
  deckInfo,
  navOnTop = false,
  fromLastSlide = false,
  onSlideChange = undefined,
  goToNextSection = undefined,
  goToPrevSection = undefined,
}: {
  courseId: string;
  deckInfo: DeckAndVideoInfo;
  navOnTop?: boolean;
  fromLastSlide?: boolean;
  onSlideChange?: (slide: Slide) => void;
  modifyRendered?: (node: any) => any;
  goToNextSection?: () => void;
  goToPrevSection?: () => void;
}) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [slideNumber, setSlideNumber] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(
    undefined as Slide | undefined
  );
  const deckId = deckInfo?.deckId;

  useEffect(() => {
    let isCancelled = false;
    if (!deckId?.length) return;
    setSlideNumber(0);
    setIsLoading(true);
    axios
      .get(`/api/get-slides/${courseId}/${encodeURIComponent(deckId)}`)
      .then((r) => {
        if (isCancelled) return;
        const slides: Slide[] = r.data || [];
        setIsLoading(false);
        setSlides(slides);
        setSlideNumber(fromLastSlide ? slides.length - 1 : 0);
      });

    return () => {
      isCancelled = true; // avoids race condition on rapid deckId changes.
    };
  }, [courseId, deckId, fromLastSlide]);

  useEffect(() => {
    if (!slides?.length || slideNumber < 0 || slideNumber >= slides.length)
      return;
    if (onSlideChange) onSlideChange(slides[slideNumber]);
    setCurrentSlide(slides[slideNumber]);
  }, [slides, slideNumber, onSlideChange]);

  if (isLoading) {
    return (
      <Box height="614px">
        <span style={{ fontSize: 'smaller' }}>{deckId}</span>
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
      <ContentWithHighlight
        mmtHtml={currentSlide?.slideContent || ''}
        renderWrapperParams={{ 'section-url': deckId }}
      />
      <SlideNavBar
        slideNumber={slideNumber}
        numSlides={slides.length}
        setSlideNumber={setSlideNumber}
        goToNextSection={goToNextSection}
        goToPrevSection={goToPrevSection}
      />
    </Box>
  );
});
