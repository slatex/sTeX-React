import { Autocomplete, Box, Button, TextField } from '@mui/material';
import { fakeLoginUsingRedirect, isLoggedIn, loginUsingRedirect, logout } from '@stex-react/api';
import { BG_COLOR, IS_SERVER } from '@stex-react/utils';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useReducer, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import styles from '../styles/utils.module.scss';

const PresetProfiles = [
  { label: 'sabrina', info: 'FAU CS student' },
  { label: 'joy', info: 'Engineering background' },
  { label: 'anushka', info: 'Philosophy background' },
];

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
      <Box sx={{ mx: '20px', userSelect: 'none' }}>
        <Box sx={{ m: 'auto', maxWidth: '700px' }}>
          <Box
            sx={{
              p: '3rem',
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
                options={PresetProfiles}
                renderInput={(params) => (
                  <TextField {...params} label="FakeId" />
                )}
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
                      if (fakeId) fakeLoginUsingRedirect(fakeId, returnBackUrl);
                    } else {
                      loginUsingRedirect(returnBackUrl);
                    }
                  }}
                >
                  {fakeLogin
                    ? 'Fake User Login'
                    : 'Login through FAU IdM-Portal'}
                </Button>
                <span
                  style={{
                    fontFamily: 'Roboto',
                    color: '#888',
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
                    Warning: Logging out from FAU IdM-Portal will NOT log you
                    out here.
                  </i>
                </span>
                <br />
                <Box className={styles['descriptive-box']}>
                  Note that you are logging into a research prototype system for
                  individualised learning support at the university level.
                  Please note the following consequences:
                  <ul>
                    <li>
                      This is not a production-ready system, so system
                      functionality may change or go away without prior notice.
                      You are participating in this experimental system
                      voluntarily, we hope that the system will enhance your
                      learning experience and success. But there will not be any
                      renumeration and/or difference to the way you are graded
                      or evaluated in the course.
                    </li>
                    <li>
                      The system will collect personalized data on all of your
                      interactions with the system, including
                      click/hover/mouse-movement-streams, page requests, results
                      of quizzes, etc. The system uses this data to generate
                      learning competency models that in turn affect the
                      generated course materials and the interaction with the
                      system.
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
                      use best professional effort to make sure that
                      personalized data cannot be re-engineered from aggregated
                      data. Details about the KI System can be found&nbsp;
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
      </Box>
    </MainLayout>
  );
};

export default LoginPage;
