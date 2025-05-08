import React from 'react';
import { Box, Typography, Paper, Alert, Button, Grid, Chip } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import DescriptionIcon from '@mui/icons-material/Description';
import { PRIMARY_COL } from '@stex-react/utils';

const fixImageUrls = (htmlContent: string | undefined): string => {
  if (!htmlContent) return '';

  let fixedHtml = htmlContent.replace(/data-flams-src=['"]([^'"]+)['"]/g, (match, path) => {
    return `src="${path}"`;
  });

  const baseUrl = 'https://mathhub.info/';

  fixedHtml = fixedHtml.replace(/src=['"](?!http|\/api)([^'"]+)['"]/g, (match, path) => {
    if (path.startsWith(baseUrl)) return `src="${path}"`;
    return `src="${baseUrl}${path}"`;
  });

  fixedHtml = fixedHtml.replace(
    /src=""\s+width="([^"]+)"\s+height="([^"]+)"\s+data-flams-src="([^"]+)"/g,
    (width, height, src) => {
      return `src="${src}" width="${width}" height="${height}"`;
    }
  );

  const imgRegex = /<img[^>]*src="([^"]*)"[^>]*>/g;
  fixedHtml = fixedHtml.replace(imgRegex, (match, srcPath) => {
    if (
      !srcPath.startsWith('http') &&
      !srcPath.startsWith('/api') &&
      !srcPath.startsWith(baseUrl)
    ) {
      const imgFileName = srcPath.split('/').pop();
      if (imgFileName) {
        return match.replace(`src="${srcPath}"`, `src="${baseUrl}images/${imgFileName}"`);
      }
    }
    return match;
  });

  return fixedHtml;
};

interface SlideDataType {
  id?: string;
  title?: string;
  index?: number;
  uri?: string;
  slideType?: string;
  paragraphs?: any[];
  preNotes?: any[];
  postNotes?: any[];
  sectionId?: string;
  slide?: {
    html?: string;
    type?: string;
    uri?: string;
  };
  [key: string]: any;
}

interface SlideContentProps {
  slide: SlideDataType | null;
}

interface SlideOptionType {
  uri: string;
  label: string;
  slideNumber: number;
  originalData: SlideDataType;
}

interface SlideNavigatorProps {
  slideOptions: SlideOptionType[];
  selectedSlide: SlideOptionType | undefined;
  setSlideUri: (uri: string) => void;
  navigateToNext: () => void;
  navigateToPrevious: () => void;
}

export function SlideContent({ slide }: SlideContentProps) {
  if (!slide) {
    return <Alert severity="warning">Slide data not found.</Alert>;
  }

  if (slide?.slide?.html) {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: fixImageUrls(slide.slide.html) }}
        style={{ padding: '5px', width: '100%', height: '100%' }}
      />
    );
  } else if (slide?.slideType === 'TEXT' && Array.isArray(slide?.paragraphs)) {
    return (
      <div style={{ padding: '5px', width: '100%', height: '100%' }}>
        {slide.paragraphs.map((para, idx) => (
          <div key={idx} style={{ marginBottom: '5px' }}>
            {para.text || JSON.stringify(para)}
          </div>
        ))}
      </div>
    );
  } else {
    return <Alert severity="warning">No HTML content available for this slide.</Alert>;
  }
}

export function SlideThumbnail({
  slide,
  isSelected,
}: {
  slide: SlideOptionType;
  isSelected: boolean;
}) {
  const getSlidePreviewContent = () => {
    const slideData = slide.originalData;

    if (slideData.slide?.html) {
      return (
        <Box
          sx={{
            height: '100%',
            width: '100%',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            dangerouslySetInnerHTML={{
              __html: fixImageUrls(slideData.slide.html),
            }}
            style={{
              transform: 'scale(0.45)',
              transformOrigin: 'top left',
              width: '220%',
              height: '220%',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          />
        </Box>
      );
    } else if (slideData.slideType === 'TEXT' && Array.isArray(slideData.paragraphs)) {
      return (
        <Box
          sx={{
            p: 1,
            height: '100%',
            overflow: 'hidden',
            fontSize: '0.7rem',
          }}
        >
          {slideData.paragraphs.slice(0, 2).map((para, idx) => (
            <Typography key={idx} variant="caption" display="block" sx={{ mb: 0.5 }}>
              {para.text?.substring(0, 40)}
              {para.text?.length > 40 ? '...' : ''}
            </Typography>
          ))}
        </Box>
      );
    } else {
      return (
        <Box sx={{ textAlign: 'center', color: '#777', p: 1 }}>
          <DescriptionIcon sx={{ fontSize: 30 }} />
          <Typography variant="caption" display="block" sx={{ fontSize: '0.7rem', mt: 1 }}>
            {slide.label || 'No preview available'}
          </Typography>
        </Box>
      );
    }
  };

  return (
    <Box
      sx={{
        height: '100px',
        overflow: 'hidden',
        position: 'relative',
        borderBottom: '1px solid #eee',
        backgroundColor: '#fff',
      }}
    >
      {getSlidePreviewContent()}

      <Chip
        label={slide.slideNumber}
        size="small"
        sx={{
          position: 'absolute',
          top: 5,
          right: 5,
          backgroundColor: isSelected ? PRIMARY_COL : '#eee',
          color: isSelected ? 'white' : '#555',
          fontSize: '0.7rem',
          height: 20,
          zIndex: 10,
        }}
      />
    </Box>
  );
}

export function SlideNavigator({
  slideOptions,
  selectedSlide,
  setSlideUri,
  navigateToNext,
  navigateToPrevious,
}: SlideNavigatorProps) {
  return (
    <>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {slideOptions.map((slide) => (
          <Grid item xs={6} sm={4} md={3} lg={2} key={slide.uri}>
            <Paper
              elevation={selectedSlide?.uri === slide.uri ? 3 : 1}
              sx={{
                height: 150,
                cursor: 'pointer',
                overflow: 'hidden',
                position: 'relative',
                transition: 'all 0.2s',
                borderColor: selectedSlide?.uri === slide.uri ? PRIMARY_COL : 'transparent',
                borderWidth: 2,
                borderStyle: 'solid',
                '&:hover': {
                  boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                  transform: 'translateY(-2px)',
                },
              }}
              onClick={() => setSlideUri(slide.uri)}
            >
              <SlideThumbnail slide={slide} isSelected={slide.uri === selectedSlide?.uri} />

              <Box
                sx={{
                  p: 1,
                  height: '50px',
                  overflow: 'hidden',
                  backgroundColor:
                    selectedSlide?.uri === slide.uri ? `${PRIMARY_COL}11` : 'transparent',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    fontWeight: selectedSlide?.uri === slide.uri ? 'bold' : 'normal',
                  }}
                >
                  {slide.label}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {selectedSlide && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mt: 2,
            pt: 2,
            borderTop: '1px solid #ddd',
          }}
        >
          <Button
            startIcon={<NavigateBeforeIcon />}
            onClick={navigateToPrevious}
            variant="outlined"
            size="small"
          >
            Previous
          </Button>

          <Typography variant="body2" sx={{ alignSelf: 'center' }}>
            Slide {slideOptions.findIndex((s) => s.uri === selectedSlide.uri) + 1} of{' '}
            {slideOptions.length}
          </Typography>

          <Button
            endIcon={<NavigateNextIcon />}
            onClick={navigateToNext}
            variant="outlined"
            size="small"
          >
            Next
          </Button>
        </Box>
      )}
    </>
  );
}
