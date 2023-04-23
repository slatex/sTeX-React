import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SettingsIcon from '@mui/icons-material/Settings';
import WarningIcon from '@mui/icons-material/Warning';
import { Box, Button, IconButton, Typography } from '@mui/material';
import type { NextPage } from 'next';
import Link from 'next/link';
import { BrowserAutocomplete } from '../../components/BrowserAutocomplete';
import { SearchBar } from '../../components/SearchBar';
import { ToursAutocomplete } from '../../components/ToursAutocomplete';
import MainLayout from '../../layouts/MainLayout';

const ExperimentsHome: NextPage = () => {
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
            <a
              href="https://courses-staging.kwarc.info"
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="contained">
                Staging server
                <OpenInNewIcon />
              </Button>
            </a>
            <br />
            <br />
            <Link href="/file-browser">
              <Button variant="contained">View article browser</Button>
            </Link>
            <br />
            <br />
            <Link href="/quiz">
              <Button variant="contained">
                Quiz Demo
              </Button>
            </Link>
            <br />
            <br />
            <Link href="/visualization">
              <Button variant="contained">Visualization Demo</Button>
            </Link>
            <br />
            <br />
            <Typography variant="h5" mb="10px">
              Paper Prototypes (What we are working towards)
            </Typography>
            <Link href="/exp/pp_dialogue_tour">
              <Button variant="contained">Dialogue Guided Tour</Button>
            </Link>
            <br />
            <br />
            <Link href="/exp/pp_teachers_and_tas">
              <Button variant="contained">Cohort overview</Button>
            </Link>
            <br />
            <br />
            <Link href="/exp/pp_students">
              <Button variant="contained">Student competency assessment</Button>
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

export default ExperimentsHome;
