import { Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { TourDisplay } from '@stex-react/stex-react-renderer';
import { BG_COLOR } from '@stex-react/utils';
import { getUriWeights, setUriWeights } from '../../api/ums';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { ToursAutocomplete } from '../../components/ToursAutocomplete';
import MainLayout from '../../layouts/MainLayout';

const GuidedTourPage: NextPage = () => {
  const [language, setLanguage] = useState('en');
  const router = useRouter();
  const tourId = router.query.id
    ? decodeURI(router.query.id as string)
    : undefined;

  return (
    <MainLayout title="Guided Tour">
      <Box display="flex" alignItems="center" mx="10px">
        <Box flexGrow={1} mr="15px">
          <ToursAutocomplete />
        </Box>
        <FormControl style={{ minWidth: '100px', margin: '10px 0' }}>
          <InputLabel id="lang-select-label">Language</InputLabel>
          <Select
            size="small"
            labelId="lang-select-label"
            id="lang-select"
            name="language"
            label="Language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="de">German</MenuItem>
            <MenuItem value="fr">French</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box flexGrow={1} bgcolor={BG_COLOR}>
        <TourDisplay
          tourId={tourId}
          language={language}
          getUriWeights={getUriWeights}
          setUriWeights={setUriWeights}
        />
      </Box>
    </MainLayout>
  );
};

export default GuidedTourPage;
