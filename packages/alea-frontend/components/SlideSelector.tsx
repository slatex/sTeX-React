import { FTMLFragment } from '@kwarc/ftml-react';
import { FTML } from '@kwarc/ftml-viewer';
import LayersClearIcon from '@mui/icons-material/LayersClear';
import { Alert, Box, Button, Card, CardContent, Paper, Typography } from '@mui/material';
import { getSlides, Slide } from '@stex-react/api';
import { getParamsFromUri, PRIMARY_COL } from '@stex-react/utils';
import { useEffect, useState } from 'react';
import { SecInfo } from '../types';

type SlideData = Slide & {
  title: string;
  index: number;
  uri: string;
  sectionUri: string;
};

export interface SlideDataWithCSS {
  slides: SlideData[];
  css: FTML.CSS[];
}

const EMPTY_SLIDE_DATA: SlideDataWithCSS = { slides: [], css: [] };

export function getSlideTitle(slide: Slide, index: number) {
  const uri = slide.slide?.uri;
  const title = getParamsFromUri(uri, ['d', 'e'])
    .map((p) => (p?.startsWith('section/') ? p.slice(8) : p))
    .map((p) => (p?.startsWith('slide') ? p.slice(6) : p))
    .filter((p) => p?.length)
    .join('/');
  return title || `Slide ${index + 1}`;
}

const getRelevantSlides = async (
  courseId: string,
  sectionId: string,
  sectionUri: string
): Promise<SlideDataWithCSS> => {
  const { slides, css } = await getSlides(courseId, sectionId);
  const relevantSlides = slides
    .map((slide, index) => ({
      ...slide,
      uri: slide.slide?.uri,
      title: getSlideTitle(slide, index),
      index,
      sectionUri,
    }))
    .filter((slide) => slide.uri); // filters out 'TEXT' slides
  console.log('relevantSlides', relevantSlides);
  return { slides: relevantSlides, css };
};

interface SlidePickerProps {
  courseId: string;
  sectionUri: string;
  slideUri: string;
  setSlideUri: (uri: string | undefined, slideNumber: number | undefined) => void;
  secInfo: Record<FTML.DocumentURI, SecInfo>;
}

export function SlidePicker({
  courseId,
  sectionUri,
  slideUri,
  setSlideUri,
  secInfo,
}: SlidePickerProps) {
  const [availableSlides, setLocalAvailableSlides] = useState<SlideDataWithCSS>({
    slides: [],
    css: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const section = secInfo[sectionUri];
  const sectionDisplayName = section ? section.title.trim() : 'Unknown Section';

  const resetSlideState = (): void => {
    setLocalAvailableSlides(EMPTY_SLIDE_DATA);
    setError(null);
  };

  const handleFetchError = (error: any): void => {
    const errorMessage = error.message || 'Failed to load slides';
    setError(errorMessage);
    setLocalAvailableSlides(EMPTY_SLIDE_DATA);
  };

  useEffect(() => {
    (availableSlides?.css ?? []).forEach((css) => FTML.injectCss(css));
  }, [availableSlides]);

  useEffect(() => {
    const fetchSlides = async () => {
      console.log('1');
      if (!sectionUri) {
        console.log('2');
        resetSlideState();
        return;
      }
      console.log('3');
      if (!section?.uri) {
        console.log('4');
        setIsLoading(false);
        setError('Section not found');
        setLocalAvailableSlides(EMPTY_SLIDE_DATA);
        return;
      }
      console.log('5');
      setIsLoading(true);
      setError(null);
      try {
        const processedSlides = await getRelevantSlides(courseId, section.id, section.uri);
        console.log('6');
        setLocalAvailableSlides(processedSlides);
      } catch (error) {
        console.log('7');
        handleFetchError(error);
      } finally {
        console.log('8');
        setIsLoading(false);
      }
    };
    fetchSlides();
  }, [sectionUri, secInfo, courseId, section]);

  const slideOptions = availableSlides?.slides ?? [];
  const selectedSlide = slideOptions.find((slide) => slide.uri === slideUri);
  console.log('selectedSlide', selectedSlide);
  console.log('slideOptions', slideOptions);
  console.log('slideUri', slideUri);

  const handleClearSection = () => {
    setSlideUri(undefined, undefined);
  };

  return (
    <>
      {!sectionUri && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Please select a section (actually) completed to view available slides
        </Alert>
      )}
      <Paper
        elevation={3}
        sx={{
          mb: 2,
          backgroundColor: '#f5f5f5',
          borderLeft: `4px solid ${PRIMARY_COL}`,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            backgroundColor: '#f0f0f0',
            borderBottom: '1px solid #ddd',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
              {sectionUri ? `Slides for: ${sectionDisplayName}` : 'No section selected'}
            </Typography>
          </Box>
          {sectionUri && (
            <Box>
              <Button
                variant="outlined"
                color="error"
                startIcon={<LayersClearIcon />}
                onClick={handleClearSection}
                size="small"
                sx={{ mr: 1 }}
              >
                Clear Selection
              </Button>
            </Box>
          )}
        </Box>
        <Box sx={{ p: 2 }}>
          {isLoading ? (
            <Typography variant="body2" sx={{ p: 2 }}>
              Loading slides...
            </Typography>
          ) : error ? (
            <Alert severity="error" sx={{ mt: 1 }}>
              {error}
            </Alert>
          ) : slideOptions.length > 0 ? (
            <>
              {selectedSlide && (
                <Card sx={{ mb: 3, overflow: 'hidden' }}>
                  <Box sx={{ height: '300px', overflow: 'auto', borderBottom: '1px solid #eee' }}>
                    {selectedSlide.slide?.html ? (
                      <FTMLFragment
                        key={selectedSlide.uri}
                        fragment={{ type: 'HtmlString', html: selectedSlide.slide.html }}
                      />
                    ) : (
                      <i>No content</i>
                    )}
                  </Box>
                  <CardContent sx={{ p: 1, backgroundColor: '#f9f9f9' }}>
                    <Typography variant="subtitle1">{selectedSlide.title}</Typography>
                  </CardContent>
                </Card>
              )}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>
                  Available Slides {selectedSlide ? `(${slideOptions.length})` : ''}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {slideOptions.map((slide, idx) => (
                    <Button
                      key={slide.uri}
                      variant={slide.uri === selectedSlide?.uri ? 'contained' : 'outlined'}
                      onClick={() => setSlideUri(slide.uri, idx + 1)}
                      sx={{
                        minWidth: '140px',
                        fontWeight: slide.uri === selectedSlide?.uri ? 'bold' : 'normal',
                      }}
                    >
                      {slide.title}
                    </Button>
                  ))}
                </Box>
              </Box>
            </>
          ) : (
            <Typography variant="body2" sx={{ p: 2 }}>
              No slides found for this section
            </Typography>
          )}
        </Box>
      </Paper>
    </>
  );
}
