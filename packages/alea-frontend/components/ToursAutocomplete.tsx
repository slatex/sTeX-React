import { Box, TextField } from '@mui/material';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import { PathToTour, fixDuplicateLabels } from '@stex-react/utils';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface TourItem {
  label: string;
  value: string;
}

async function getGuidedTourList() {
  console.log('Fetching guided tour list...');
  const data = await axios
    .get('https://stexmmt.mathhub.info/:vollki/list')
    .then((r) => {
      console.log('Guided tour list fetched');
      return r.data;
    });
  return data;
}

function simplifyLabelsWithSpan(RAW: TourItem[]) {
  const updated: TourItem[] = [];
  for (const item of RAW) {
    const m = item.label.match(/^<span[^>]*>(.+)<\/span>$/);
    updated.push({ value: item.value, label: m ? m[1] : item.label });
  }
  return updated;
}
export let FETCHED_TOURS: TourItem[] | undefined = undefined;

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
  const [tours, setTours] = useState<TourItem[]>([]);

  useEffect(() => {
    if (FETCHED_TOURS) {
      setTours(FETCHED_TOURS);
      return;
    }
    getGuidedTourList().then((data) => {
      FETCHED_TOURS = fixDuplicateLabels(simplifyLabelsWithSpan(data));
      setTours(FETCHED_TOURS);
    });
  }, []);
  return (
    <Autocomplete
      size="small"
      id="combo-box-demo"
      filterOptions={filterOptions}
      options={tours}
      renderInput={(params) => (
        <TextField {...params} label="Select Guided Tour" />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          {/*mmtHTMLToReact((option as any).label)*/}
          TODO ALEA-4
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
