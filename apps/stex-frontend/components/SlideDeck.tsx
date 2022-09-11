import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Box, IconButton, LinearProgress } from '@mui/material';
import { ContentWithHighlight } from '@stex-react/stex-react-renderer';
import axios from 'axios';
import { Dispatch, memo, SetStateAction, useEffect, useState } from 'react';
import { DeckAndVideoInfo, Slide } from '../shared/slides';

export function SlideNavBar({
  slideNumber,
  setSlideNumber,
  numSlides,
}: {
  slideNumber: number;
  setSlideNumber: Dispatch<SetStateAction<number>>;
  numSlides: number;
}) {
  return (
    <Box display="flex" justifyContent="flex-end" alignItems="center">
      <IconButton
        disabled={slideNumber === 0}
        onClick={() => setSlideNumber(0)}
      >
        <FirstPageIcon />
      </IconButton>
      <IconButton
        disabled={slideNumber === 0}
        onClick={() => setSlideNumber((curr) => curr - 1)}
      >
        <NavigateBeforeIcon />
      </IconButton>
      <span style={{ fontSize: '18px' }}>
        {slideNumber + 1} / {numSlides}
      </span>
      <IconButton
        disabled={slideNumber >= numSlides - 1}
        onClick={() => setSlideNumber((curr) => curr + 1)}
      >
        <NavigateNextIcon />
      </IconButton>
      <IconButton
        disabled={slideNumber >= numSlides - 1}
        onClick={() => setSlideNumber(numSlides - 1)}
      >
        <LastPageIcon />
      </IconButton>
    </Box>
  );
}

export const SlideDeck = memo(function SlidesFromUrl({
  courseId,
  deckInfo,
  navOnTop = false,
  onSlideChange = undefined,
}: {
  courseId: string;
  deckInfo: DeckAndVideoInfo;
  navOnTop?: boolean;
  onSlideChange?: (slide: Slide) => void;
  modifyRendered?: (node: any) => any;
}) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [slideNumber, setSlideNumber] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(
    undefined as Slide | undefined
  );
  const deckId = deckInfo?.deckId;

  useEffect(() => {
    if (!deckId?.length) return;
    setSlideNumber(0);
    setIsLoading(true);
    axios
      .get(`/api/get-slides/${courseId}/${encodeURIComponent(deckId)}`)
      .then((r) => {
        const slides: Slide[] = r.data || [];
        setIsLoading(false);
        setSlides(slides);
      });
  }, [courseId, deckId]);

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
      display="flex"
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
      />
    </Box>
  );
});
