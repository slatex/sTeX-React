import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import {
  fakeLoginUsingRedirect,
  isLoggedIn,
  loginUsingRedirect,
  logout,
} from '@stex-react/api';
import { BG_COLOR, IS_SERVER, localStore } from '@stex-react/utils';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useReducer, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import styles from '../styles/utils.module.scss';

const PresetPersonas = [
  { label: 'sabrina', info: 'FAU CS student' },
  { label: 'joy', info: 'Engineering background' },
  { label: 'anushka', info: 'Philosophy background' },
  { label: 'blank', info: 'Empty learner model' },
];

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function PersonaChooser({
  persona,
  onPersonaUpdate,
}: {
  persona: string;
  onPersonaUpdate: (label: string) => void;
}) {
  return (
    <FormControl>
      <InputLabel>Choose Persona</InputLabel>
      <Select
        value={persona}
        onChange={(e) => {
          const label = e.target.value;
          onPersonaUpdate(label);
        }}
        variant="standard"
        sx={{ minWidth: '130px' }}
      >
        {PresetPersonas.map((persona) => (
          <MenuItem key={persona.label} value={persona.label}>
            {persona.label}&nbsp;<i>({persona.info})</i>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export function GuestLogin({ returnBackUrl }: { returnBackUrl: string }) {
  const [persona, setProfileLabel] = useState<string>('sabrina');
  const [guestId, setGuestId] = useState<string>('sabrina');
  const [guestUserName, setGuestUserName] = useState<string>('Sabrina');

  const [enableGuest, setEnableGuest] = useState(false);

  return (
    <>
      {!enableGuest && (
        <Button
          fullWidth
          variant="contained"
          size="large"
          sx={{ fontSize: '32x', my: '10px' }}
          onClick={() => setEnableGuest(true)}
        >
          Guest User Login
        </Button>
      )}
      <Box
        sx={{
          transition: 'height ease 500ms;',
          height: enableGuest ? '240px' : '0px',
          overflow: 'hidden',
          border: enableGuest ? '1px solid #AAA' : 'undefined',
          padding: enableGuest ? '5px' : 0,
          borderRadius: '10px',
          my: enableGuest ? '10px' : 0,
        }}
      >
        <Box display="flex" alignItems="baseline" gap="10px">
          <PersonaChooser
            persona={persona}
            onPersonaUpdate={(label: string) => {
              setProfileLabel(label);
              for (const p of PresetPersonas) {
                if (p.label === label) {
                  setGuestId(p.label);
                  setGuestUserName(capitalizeFirstLetter(p.label));
                }
              }
            }}
          />
          <TextField
            label="Guest Id"
            value={guestId}
            onChange={(e) => setGuestId(e.target.value)}
            variant="standard"
            margin="dense"
            sx={{ flexGrow: '1' }}
          />
        </Box>
        <TextField
          label="Guest Username"
          value={guestUserName}
          onChange={(e) => setGuestUserName(e.target.value)}
          variant="standard"
          margin="dense"
          fullWidth
        />

        <Typography color="#777" variant="body2" mt="10px">
          The platform content is tailored to the learner&apos;s competencies.
          Please choose an initial persona above to get started.
        </Typography>
        <Button
          fullWidth
          variant="contained"
          size="large"
          sx={{ fontSize: '32x', mt: '5px' }}
          onClick={() => {
            let browserInstance = localStore.getItem('browser-instance');
            if (!browserInstance) {
              browserInstance = `${Math.floor(Math.random() * 1e7)}`;
              localStore.setItem('browser-instance', browserInstance);
            }
            const fakeId = `guest_${browserInstance}_${guestId}`;
            const guestName = 'Guest: ' + guestUserName;
            fakeLoginUsingRedirect(fakeId, guestName, returnBackUrl, persona);
          }}
          disabled={!guestId?.length}
        >
          Login as a guest
        </Button>
      </Box>

      <Typography color="#777" variant="body2">
        While the VoLL-KI SSFC system is initially intended for FAU students, we
        are working on expanding our offerings to more learners. Meanwhile, we
        encourage you to login as a guest and test drive the system.
      </Typography>
    </>
  );
}
const LoginPage: NextPage = () => {
  const loggedIn = isLoggedIn();
  const router = useRouter();
  const [fakeId, setFakeId] = useState('');
  const returnBackUrl = router.query.target as string;
  const [clickCount, updateClickCount] = useReducer((x) => x + 1, 0);
  const fakeLogin = clickCount >= 1;
  if (loggedIn && !IS_SERVER) router.push('/');

  return (
    <MainLayout>
      <br />
      <Box
        sx={{ m: 'auto', maxWidth: '700px', px: '10px', userSelect: 'none' }}
      >
        <Typography
          sx={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }}
        >
          Unfortunately, the IdM login facility of website is not working. We
          are working to get it resolved and apologize for the inconvenience.
        </Typography>
        <Box
          sx={{
            p: '1.5rem',
            borderRadius: '0.3rem',
            border: '1px solid #dee2e6',
            backgroundColor: BG_COLOR,
          }}
        >
          <br />
          {!loggedIn && fakeLogin && (
            <Autocomplete
              id="free-solo-demo"
              freeSolo
              getOptionLabel={(option) =>
                typeof option === 'string' ? option : option.label
              }
              inputValue={fakeId}
              onInputChange={(event, newInputValue) => {
                setFakeId(newInputValue);
              }}
              sx={{ my: '10px' }}
              options={PresetPersonas}
              renderInput={(params) => <TextField {...params} label="FakeId" />}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  {option.label}&nbsp;<i>({option.info})</i>
                </Box>
              )}
            />
          )}
          {loggedIn ? (
            <>
              You are already logged in.
              <Button
                fullWidth
                variant="contained"
                size="large"
                sx={{ w: '100%' }}
                onClick={() => logout()}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                fullWidth
                variant="contained"
                size="large"
                sx={{ fontSize: '32x' }}
                onClick={() => {
                  if (fakeLogin) {
                    if (fakeId)
                      fakeLoginUsingRedirect(fakeId, undefined, returnBackUrl);
                  } else {
                    loginUsingRedirect(returnBackUrl);
                  }
                }}
              >
                {fakeLogin ? 'Fake User Login' : 'Login through FAU IdM-Portal'}
              </Button>
              <span
                style={{
                  fontFamily: 'Roboto',
                  color: '#777',
                  marginTop: '10px',
                }}
              >
                <hr style={{ width: '90%' }} />
                Please{' '}
                <span
                  style={{ display: 'inline' }}
                  onDoubleClick={updateClickCount}
                >
                  remember
                </span>{' '}
                to logout after you are done.
                <br />
                <br />
                <i style={{ color: 'red' }}>
                  Warning: Logging out from FAU IdM-Portal will NOT log you out
                  here.
                </i>
              </span>

              {!loggedIn && <GuestLogin returnBackUrl={returnBackUrl} />}
              <br />
              <Box className={styles['descriptive-box']}>
                Note that you are logging into a research prototype system for
                individualised learning support at the university level. Please
                note the following consequences:
                <ul>
                  <li>
                    This is not a production-ready system, so system
                    functionality may change or go away without prior notice.
                    You are participating in this experimental system
                    voluntarily, we hope that the system will enhance your
                    learning experience and success. But there will not be any
                    renumeration and/or difference to the way you are graded or
                    evaluated in the course.
                  </li>
                  <li>
                    The system will collect personalized data on all of your
                    interactions with the system, including
                    click/hover/mouse-movement-streams, page requests, results
                    of quizzes, etc. The system uses this data to generate
                    learning competency models that in turn affect the generated
                    course materials and the interaction with the system.
                  </li>
                  <li>
                    Note that personalized data will only be accessible to
                    agents that are authenticated with your personal IDM
                    credentials. In particular, no personal data will be
                    transmitted outside the system without your consent.
                  </li>
                  <li>
                    The VoLL-KI research project will use this data in
                    aggregated, anonymised, and/or pseudonymized form to
                    evaluate of the system and the underlying methods. We will
                    use best professional effort to make sure that personalized
                    data cannot be re-engineered from aggregated data. Details
                    about the KI System can be found&nbsp;
                    <a
                      href="https://gitos.rrze.fau.de/voll-ki/fau/SSFC/-/wikis/home"
                      target="_blank"
                      rel="noreferrer"
                    >
                      here
                    </a>
                    .
                  </li>
                </ul>
              </Box>
            </>
          )}
        </Box>
        <br />
      </Box>
    </MainLayout>
  );
};

export default LoginPage;
