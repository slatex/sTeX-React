import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SettingsIcon from '@mui/icons-material/Settings';
import WarningIcon from '@mui/icons-material/Warning';
import { Box, Button, IconButton } from '@mui/material';
import { BloomDimension } from '@stex-react/api';
import { SelfAssessment2 } from '@stex-react/stex-react-renderer';
import type { NextPage } from 'next';
import Link from 'next/link';
import { BrowserAutocomplete } from '../../components/BrowserAutocomplete';
import { SearchBar } from '../../components/SearchBar';
import { ToursAutocomplete } from '../../components/ToursAutocomplete';
import MainLayout from '../../layouts/MainLayout';
import { localStore } from '@stex-react/utils';

function ExternalButtonLink({ href, text }: { href: string; text: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer">
      <Button variant="contained" sx={{ m: '5px' }}>
        {text}
        <OpenInNewIcon />
      </Button>
    </a>
  );
}

function InternalButtonLink({ href, children }: any) {
  return (
    <Link href={href}>
      <Button variant="contained" sx={{ m: '5px' }}>
        {children}
      </Button>
    </Link>
  );
}

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
            <Box>
              <InternalButtonLink href="/quiz">
                Quiz Dashboard
              </InternalButtonLink>
            </Box>
            <Box>
              <h2>Paper Prototypes (What we are working towards)</h2>
              <InternalButtonLink href="/exp/pp_dialogue_tour">
                Dialogue Guided Tour
              </InternalButtonLink>
              <InternalButtonLink href="/exp/pp_teachers_and_tas">
                Cohort overview
              </InternalButtonLink>
              <InternalButtonLink href="/exp/pp_students">
                Student competency assessment
              </InternalButtonLink>

              <InternalButtonLink href="/visualization">
                Visualization Demo
              </InternalButtonLink>
            </Box>
            <Box>
              <h2>Debug</h2>
              <InternalButtonLink href="/exp/gpt-questions">
                GPT Questions page
              </InternalButtonLink>
              <InternalButtonLink href="/debug-section">
                Debug Document Sections
              </InternalButtonLink>
              <InternalButtonLink href="/file-browser">
                Article browser
              </InternalButtonLink>
            </Box>
            <Box>
              <h2>System Info</h2>
              MMT server: {process.env.NEXT_PUBLIC_MMT_URL}
              <br />
              LMS server: {process.env.NEXT_PUBLIC_LMS_URL}
            </Box>
            <Box>
              <h2>ALeA Servers</h2>
              <ExternalButtonLink
                href="https://courses.voll-ki.fau.de"
                text="Production"
              />
              <ExternalButtonLink
                href="https://courses-staging.kwarc.info"
                text="Staging"
              />
            </Box>
            <Box>
              <h2>MMT Servers</h2>
              <ExternalButtonLink
                href="https://stexmmt.mathhub.info/:sTeX"
                text="Production"
              />
              <ExternalButtonLink
                href="https://building.beta.vollki.kwarc.info/:sTeX"
                text="Beta (mmt.beta....)"
              />
              <ExternalButtonLink
                href="https://building.beta.vollki.kwarc.info/:sTeX"
                text="(Unstable!) Building (building.beta...)"
              />
            </Box>
            &nbsp;&nbsp;
            <BrowserAutocomplete />
            <ToursAutocomplete />
            <SearchBar />
            <Box m="10px" width="fit-content">
              <SelfAssessment2
                dims={[
                  BloomDimension.Remember,
                  BloomDimension.Understand,
                  BloomDimension.Apply,
                  BloomDimension.Analyse,
                  BloomDimension.Evaluate,
                  BloomDimension.Create,
                ]}
                uri={''}
              />
            </Box>
          </Box>
        </main>
      </div>
    </MainLayout>
  );
};

export default ExperimentsHome;
