import { Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { TourDisplay } from '@stex-react/stex-react-renderer';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { ToursAutocomplete } from '../../components/ToursAutocomplete';
import { BG_COLOR } from '../../constants';
import MainLayout from '../../layouts/MainLayout';

// HACK: Get this from MMT server.
const USER_MODELS = ['professor', 'testuser1', 'nulluser'];

const GuidedTourPage: NextPage = () => {
  const [userModel, setUserModel] = useState(USER_MODELS[2]);
  const [language, setLanguage] = useState('en');
  const router = useRouter();
  const tourId = decodeURI(router.query.id as string);

  return (
    <MainLayout title="Guided Tour">
      <Box m="10px">
        <ToursAutocomplete />
        <FormControl style={{ minWidth: '100px', margin: '10px 20px 10px 0' }}>
          <InputLabel id="user-select-label">User Model</InputLabel>
          <Select
            labelId="user-select-label"
            id="user-select"
            name="userModel"
            label="User Model"
            value={userModel}
            onChange={(e) => setUserModel(e.target.value)}
          >
            {USER_MODELS.map((userModel) => (
              <MenuItem key={userModel} value={userModel}>
                {userModel}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl style={{ minWidth: '100px', margin: '10px 0' }}>
          <InputLabel id="lang-select-label">Language</InputLabel>
          <Select
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
        <Box display="flex">
          <Box flexGrow={1} bgcolor={BG_COLOR}>
            <TourDisplay
              tourId={tourId}
              userModel={userModel}
              language={language}
            />
          </Box>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default GuidedTourPage;
