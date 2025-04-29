import { useState, useEffect } from 'react';
import { 
  Box, 
  FormControl, 
  InputLabel, 
  MenuItem, 
  Select, 
  IconButton, 
  Tooltip, 
  Typography, 
  Chip, 
  Paper 
} from '@mui/material';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import ClearIcon from '@mui/icons-material/Clear';
import axios from 'axios';
import { PRIMARY_COL } from '@stex-react/utils';
import { Section } from '../pages/coverage-update';

interface SlideSelectorProps {
  sectionName: string;
  slideUri: string;
  setSlideUri: (uri: string) => void;
  sectionNames: Section[];
}

export function SlideSelector({ sectionName, slideUri, setSlideUri, sectionNames }: SlideSelectorProps) {
  const [showSlidePreview, setShowSlidePreview] = useState(false);
  const [availableSlides, setAvailableSlides] = useState<{ [key: string]: any[] }>({});

  useEffect(() => {
    
    const fetchSlides = async () => {
      if (!sectionName) {
        setAvailableSlides({});
        return;
      }
      
      const sectionUri = getUriForSectionName(sectionName, sectionNames);
      const section = sectionNames.find(({ uri }) => uri === sectionUri);
      
      if (section?.id) {
        try {
         
          const urlParams = new URLSearchParams(window.location.search);
          const courseId = urlParams.get('courseId') || '';
          
          
          const response = await axios.get(`/api/get-slides?courseId=${courseId}&sectionIds=${section.id}`);
          if (response.data && Object.keys(response.data).length > 0) {
            
            const processedData = { ...response.data };
            
           
            Object.keys(processedData).forEach(sectId => {
              if (Array.isArray(processedData[sectId])) {
                processedData[sectId] = processedData[sectId].map((slide, idx) => {
                  
                  let slideNumber = idx + 1;
                  const slideIdMatch = slide.id?.match(/slide-(\d+)$/);
                  const slideUriMatch = slide.uri?.match(/slide-(\d+)$/);
                  
                  if (slideIdMatch && slideIdMatch[1]) {
                    slideNumber = parseInt(slideIdMatch[1], 10);
                  } else if (slideUriMatch && slideUriMatch[1]) {
                    slideNumber = parseInt(slideUriMatch[1], 10);
                  }
                  
                  
                  const slidePathMatch = slide.uri?.match(/\/section\/([^\/]+)/);
                  const slidePath = slidePathMatch ? slidePathMatch[1] : '';
                  
                  return {
                    ...slide,
                    index: idx,
                    id: slide.id || `${sectId}-slide-${slideNumber}`,
                    title: slide.title || `Slide ${slideNumber}${slidePath ? ` (${slidePath})` : ''}`
                  };
                });
              }
            });
            
            setAvailableSlides(processedData);
            console.log(`Fetched slides for section "${sectionName}":`, processedData);
          } else {
            
            const mockSlides = Array(12).fill(null).map((_, idx) => ({
              id: `${section.id}-slide-${idx + 1}`,
              title: `Slide ${idx + 1}`,
              index: idx
            }));
            setAvailableSlides({ [section.id]: mockSlides });
            console.log(`Created mock slides for section "${sectionName}":`, mockSlides);
          }
        } catch (error) {
          console.error('Error fetching slides:', error);
          
          const mockSlides = Array(12).fill(null).map((_, idx) => ({
            id: `${section.id}-slide-${idx + 1}`,
            title: `Slide ${idx + 1}`,
            index: idx
          }));
          setAvailableSlides({ [section.id]: mockSlides });
        }
      }
    };
    
    fetchSlides();
  }, [sectionName, sectionNames]);

  const getSlideOptions = () => {
    const sectionId = sectionNames.find(({ title }) => title.trim() === sectionName)?.id;
    if (!sectionId || !availableSlides[sectionId]) return [];
    
    
    return availableSlides[sectionId].map((slide, idx) => {
      
      let slideNumber = idx + 1;
      let slidePath = '';
      
      
      if (typeof slide.id === 'string') {
        const match = slide.id.match(/(\d+)$/);
        if (match) slideNumber = parseInt(match[1], 10);
        
        
        const pathMatch = slide.id.match(/\/section\/([^\/]+)/);
        if (pathMatch) slidePath = pathMatch[1];
      }
      
      
      if (typeof slide.uri === 'string') {
        const parts = slide.uri.split('/');
        if (parts.length >= 2) {
          slidePath = parts.slice(0, -1).join('/');
          
          
          const lastPart = parts[parts.length - 1];
          const match = lastPart.match(/slide-(\d+)$/);
          if (match) slideNumber = parseInt(match[1], 10);
        }
      }
      
      const uri = slide.id || slide.uri || `${sectionId}-slide-${slideNumber}`;
      let label = slide.title;
      
      
      if (!label && typeof uri === 'string') {
        if (uri.includes('/')) {
          
          const cleanUri = uri.replace(/-slide-\d+$/, '');
          const segments = cleanUri.split('/');
          if (segments.length > 2) {
            
            label = `Slide ${slideNumber}: ${segments[segments.length - 1].replace(/-/g, ' ')}`;
          }
        }
      }
      
      
      if (!label) {
        label = `Slide ${slideNumber}`;
      }
      
      return { uri, label };
    });
  };

  const slideOptions = getSlideOptions();

  function getUriForSectionName(sectionName: string, sectionNames: Section[]): string {
    const section = sectionNames.find(({ title }) => title.trim() === sectionName);
    return section?.uri || '';
  }

  return (
    <>
      {showSlidePreview && sectionName && (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 2, 
            mb: 2, 
            backgroundColor: '#f5f5f5',
            borderLeft: `4px solid ${PRIMARY_COL}`
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Slides for: {sectionName}
            </Typography>
            <IconButton onClick={() => setShowSlidePreview(false)} size="small">
              <ClearIcon />
            </IconButton>
          </Box>
          
          {slideOptions.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {slideOptions.map((slide) => (
                <Chip
                  key={slide.uri}
                  label={slide.label}
                  onClick={() => setSlideUri(slide.uri)}
                  color={slideUri === slide.uri ? "primary" : "default"}
                  icon={<SlideshowIcon />}
                  sx={{ mb: 1 }}
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              No slides available for this section
            </Typography>
          )}
        </Paper>
      )}

      <FormControl sx={{ mx: '5px' }}>
        <InputLabel id="slide-select-label">Slide</InputLabel>
        <Select
          labelId="slide-select-label"
          value={slideUri}
          onChange={(e) => setSlideUri(e.target.value)}
          label="Slide"
          sx={{ minWidth: '150px' }}
          endAdornment={
            <Tooltip title="View all slides for this section">
              <IconButton 
                size="small" 
                sx={{ marginRight: 2 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSlidePreview(!showSlidePreview);
                }}
              >
                <SlideshowIcon />
              </IconButton>
            </Tooltip>
          }
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {slideOptions.map((slide) => (
            <MenuItem key={slide.uri} value={slide.uri}>
              {slide.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
}


export function getSlideNameByUri(uri: string, availableSlides: { [key: string]: any[] }): string {
  if (!uri) return '';
  
  
  for (const sectionId in availableSlides) {
    const slides = availableSlides[sectionId];
    
    
    const slide = slides.find(s => s.id === uri || s.uri === uri);
    if (slide) {
      if (slide.title) return slide.title;
    }
  }
  
  
  if (typeof uri === 'string') {
    
    if (uri.includes('/')) {
      const parts = uri.split('/');
      let slideNumber = "?";
      
      
      const lastPart = parts[parts.length - 1];
      const match = lastPart.match(/slide-(\d+)$/);
      if (match) slideNumber = match[1];
      
      
      if (parts.length > 1) {
        const sectionName = parts[parts.length - 2].replace(/-/g, ' ');
        return `Slide ${slideNumber}: ${sectionName}`;
      }
      
      return `Slide ${slideNumber}`;
    }
    
    
    const simpleMatch = uri.match(/slide-(\d+)$/);
    if (simpleMatch) {
      return `Slide ${simpleMatch[1]}`;
    }
  }
  
  
  const numMatch = uri.match(/(\d+)$/);
  if (numMatch) {
    return `Slide ${numMatch[1]}`;
  }
  
  
  return uri.split('/').pop() || uri;
}