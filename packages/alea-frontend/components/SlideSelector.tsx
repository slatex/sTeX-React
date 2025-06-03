import LayersClearIcon from '@mui/icons-material/LayersClear';
import { Alert, Box, Button, Card, CardContent, Paper, Typography } from '@mui/material';
import { CSS, getSlides } from '@stex-react/api';
import { FTMLFragment, injectCss } from '@stex-react/ftml-utils';
import { PRIMARY_COL } from '@stex-react/utils';
import { useEffect, useState } from 'react';
import { Section } from '../types';

interface SlidePickerProps {
  courseId: string;
  sectionUri: string;
  slideUri: string;
  setSlideUri: (uri: string, slideNumber: number) => void;
  sectionNames: Section[];
}
interface SlideData {
  id: string;
  title: string;
  index: number;
  uri: string;
  slideType?: string;
  paragraphs?: any[];
  sectionId?: string;
  slide?: {
    html?: string;
    type?: string;
    uri?: string;
  };
  [key: string]: any;
}
export interface SlidesWithCSS {
  slides: SlideData[];
  css: CSS[];
}

interface AvailableSlides {
  [sectionId: string]: SlidesWithCSS;
}

export function SlidePicker({
  courseId,
  sectionUri,
  slideUri,
  setSlideUri,
  sectionNames,
}: SlidePickerProps) {
  const [availableSlides, setLocalAvailableSlides] = useState<AvailableSlides>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const section = sectionNames.find(
    ({ uri }) => uri && sectionUri && uri.trim() === sectionUri.trim()
  );
  const sectionDisplayName = section ? section.title.trim() : 'Unknown Section';

  const constructUriFromId = (id: string, sectionId: string): string => {
    const slideMatch = id.match(/slide-(\d+)$/);
    const slideNumber = slideMatch ? slideMatch[1] : '1';
    return `https://mathhub.info?a=courses/FAU/meta-inf&p=${sectionId}/snip&d=${sectionId}&l=en&e=paragraph&slide=${slideNumber}`;
  };

  const processSlideData = (rawSlides: any[], sectionId: string): SlideData[] => {
    return rawSlides
      .map((slide: any, index: number) => {
        let slideUri = '';
        if (slide.uri) {
          slideUri = slide.uri;
        } else if (slide.slide && slide.slide.uri) {
          slideUri = slide.slide.uri;
        } else if (slide.id) {
          slideUri = constructUriFromId(slide.id, sectionId);
        } else {
          slideUri = constructUriFromId(`slide-${index + 1}`, sectionId);
        }

        return {
          ...slide,
          uri: slideUri,
          id: slide.id || `slide-${index + 1}`,
          title: slide.title || `Slide ${index + 1}`,
          index: index,
          sectionId: sectionId,
        };
      })
      .filter((slide: any) => slide.uri);
  };

  const fetchSlidesFromApi = async (sectionId: string): Promise<AvailableSlides> => {
    const { slides, css } = await getSlides(courseId, sectionId);
    const processedSlides: AvailableSlides = {};
    processedSlides[sectionId] = { slides: processSlideData(slides, sectionId), css };
    return processedSlides;
  };

  const validateProcessedSlides = (processedSlides: AvailableSlides): void => {
    const totalSlides = Object.values(processedSlides).reduce(
      (acc, section) => acc + section.slides.length,
      0
    );
    if (totalSlides === 0) {
      throw new Error('No slides found for this section');
    }
  };

  const resetSlideState = (): void => {
    setLocalAvailableSlides({});
    setError(null);
  };

  const handleFetchError = (error: any): void => {
    const errorMessage = error.message || 'Failed to load slides';
    setError(errorMessage);
    setLocalAvailableSlides({});
  };

  useEffect(() => {
    if (section?.id && availableSlides[section.id]?.css) {
      const cssData = availableSlides[section.id].css;
      cssData.forEach((css) => {
        injectCss(css);
      });
    }
  }, [availableSlides, section?.id]);

  useEffect(() => {
    const fetchSlides = async () => {
      if (!sectionUri) {
        resetSlideState();
        return;
      }

      if (!section?.id) {
        setIsLoading(false);
        setError('Section not found');
        setLocalAvailableSlides({});
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const processedSlides = await fetchSlidesFromApi(section.id);
        validateProcessedSlides(processedSlides);
        setLocalAvailableSlides(processedSlides);
      } catch (error) {
        handleFetchError(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSlides();
  }, [sectionUri, sectionNames, courseId]);

  const getSlideOptions = () => {
    if (!section?.id || !availableSlides[section.id]) return [];

    return availableSlides[section.id].slides
      .filter((slide) => slide.slideType !== 'TEXT')
      .map((slide, idx) => {
        const label = `Slide ${idx + 1}`;
        return {
          uri: slide.uri,
          html: slide.slide?.html,
          label,
          slideNumber: idx + 1,
          originalData: slide,
        };
      });
  };

  const slideOptions = getSlideOptions();
  const selectedSlide = slideOptions.find((slide) => slide.uri === slideUri);

  const handleClearSection = () => {
    setSlideUri(null, 0);
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
                    {selectedSlide.html ? (
                      <FTMLFragment
                        key={selectedSlide.uri}
                        fragment={{ html: selectedSlide.html }}
                      />
                    ) : selectedSlide.originalData.slideType === 'TEXT' &&
                      Array.isArray(selectedSlide.originalData.paragraphs) ? (
                      <div style={{ padding: '5px', width: '100%', height: '100%' }}>
                        {selectedSlide.originalData.paragraphs.map((para, idx) => (
                          <div key={idx} style={{ marginBottom: '5px' }}>
                            {para.text || JSON.stringify(para)}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <i>No content</i>
                    )}
                  </Box>
                  <CardContent sx={{ p: 1, backgroundColor: '#f9f9f9' }}>
                    <Typography variant="subtitle1">{selectedSlide.label}</Typography>
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
                      {slide.label}
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
