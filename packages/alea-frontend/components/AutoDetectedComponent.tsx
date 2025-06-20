import { Box, Typography } from '@mui/material';
import { FTML } from '@kwarc/ftml-viewer';

interface AutoDetectedTooltipContentProps {
  autoDetected?: {
    clipId?: string;
    sectionUri?: FTML.DocumentURI;
    slideUri?: string;
  };
  getSectionName: (uri: FTML.DocumentURI) => string;
  showResolvedSectionName?: boolean;
}

export function AutoDetectedTooltipContent({
  autoDetected,
  getSectionName,
  showResolvedSectionName = true,
}: AutoDetectedTooltipContentProps) {
  if (!autoDetected) {
    return <Typography variant="body2">No auto-detected data available</Typography>;
  }

  const resolvedSection = showResolvedSectionName
    ? getSectionName(autoDetected.sectionUri || '') || <i>None</i>
    : autoDetected.sectionUri || <i>None</i>;

  return (
    <Box>
      <Typography>
        <strong>Clip ID:</strong> {autoDetected.clipId || <i>None</i>}
      </Typography>
      <Typography>
        <strong>Section:</strong> {resolvedSection}
      </Typography>
      <Typography>
        <strong>Slide:</strong> {autoDetected.slideUri || <i>None</i>}
      </Typography>
    </Box>
  );
}
