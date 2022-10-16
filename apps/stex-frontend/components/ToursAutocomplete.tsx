import {
  Autocomplete,
  Box,
  createFilterOptions,
  TextField,
} from '@mui/material';
import { mmtHTMLToReact } from '@stex-react/stex-react-renderer';
import { fixDuplicateLabels, PathToTour } from '@stex-react/utils';
import { useRouter } from 'next/router';
import RAW_TOURS from '../guided-tour-list.preval';

function simplifyLabelsWithSpan(RAW: { value: string; label: string }[]) {
  const updated: { value: string; label: string }[] = [];
  for (const item of RAW) {
    const m = item.label.match(/^<span[^>]*>(.+)<\/span>$/);
    updated.push({ value: item.value, label: m ? m[1] : item.label });
  }
  return updated;
}
export const TOURS = fixDuplicateLabels(simplifyLabelsWithSpan(RAW_TOURS));

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
