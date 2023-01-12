import SettingsIcon from '@mui/icons-material/Settings';
import WarningIcon from '@mui/icons-material/Warning';
import { Box, Button, IconButton } from '@mui/material';
import type { NextPage } from 'next';
import Link from 'next/link';
import { BrowserAutocomplete } from '../components/BrowserAutocomplete';
import { SearchBar } from '../components/SearchBar';
import { ToursAutocomplete } from '../components/ToursAutocomplete';
import MainLayout from '../layouts/MainLayout';

const Home: NextPage = () => {
  return (
    <MainLayout title="Experiments | VoLL-KI">
      <IconButton sx={{ float: 'right' }}>
        <Link href="/settings">
          <SettingsIcon />
        </Link>
      </IconButton>
      <Box textAlign="center" m="20px">
        <h1>VoLL-KI Experiments</h1>
        <i>
          Enter at your own risk!
          <WarningIcon
            sx={{ mt: '-10px', color: '#e20', transform: 'translateY(5px)' }}
          />
        </i>
      </Box>
      <div>
        <main style={{ margin: '10px' }}>
          <Box m="10px auto" maxWidth="600px" textAlign="center">
            <Link href="/file-browser">
              <Button variant="contained">View article browser</Button>
            </Link>
            <br />
            <br />
            <Link href="/quiz">
              <Button variant="contained">Quiz Demo</Button>
            </Link>
            <br />
            <br />
            <Link href="/visualization">
              <Button variant="contained">Visualization Demo</Button>
            </Link>
            <br />
            <br />
            <Link href="/flash-cards/ai-1">
              <Button variant="contained">Flash Cards - AI</Button>
            </Link>
            &nbsp;
            <Link href="/flash-cards/iwgs">
              <Button variant="contained">Flash Cards - IWGS</Button>
            </Link>
            &nbsp;
            <Link href="/flash-cards/krmt">
              <Button variant="contained">Flash Cards - KRMT</Button>
            </Link>
            <br />
            <br />
            <BrowserAutocomplete />
            <ToursAutocomplete />
            <br />
            <SearchBar />
          </Box>
        </main>
      </div>
    </MainLayout>
  );
};

export default Home;
