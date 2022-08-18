import {
  Autocomplete,
  Box,
  createFilterOptions,
  TextField,
} from '@mui/material';
import { useRouter } from 'next/router';
import { RAW_TOURS } from '../tours';
import { mmtHTMLToReact } from '@stex-react/stex-react-renderer';
import { fixDuplicateLabels, PathToTour } from '@stex-react/utils';

export const TOURS = fixDuplicateLabels(RAW_TOURS);

// Limit number of options rendered at a time to improve performance.
const filterOptions = createFilterOptions({
  matchFrom: 'any',
  limit: 70,
});

export function ToursAutocomplete({
  onSelect,
}: {
  onSelect?: (tourId: string) => void;
}) {
  const router = useRouter();
  return (
    <Autocomplete
      size="small"
      id="combo-box-demo"
      filterOptions={filterOptions}
      options={TOURS}
      renderInput={(params) => (
        <TextField {...params} label="Select Guided Tour" />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          {mmtHTMLToReact((option as any).label)}
        </Box>
      )}
      onChange={(_e, n: any) => {
        if (!n?.value) return;
        if (onSelect) {
          onSelect(n.value);
        } else {
          router.push(PathToTour(n.value));
        }
      }}
    />
  );
}
