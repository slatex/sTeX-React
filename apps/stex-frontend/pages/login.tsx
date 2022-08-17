import { Box, Button, TextField } from '@mui/material';
import { BG_COLOR } from '@stex-react/utils';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';

import {
  fakeLoginUsingRedirect, isLoggedIn,
  loginUsingRedirect,
  logout
} from '../api/ums';
import MainLayout from '../layouts/MainLayout';

const LoginPage: NextPage = () => {
  const loggedIn = isLoggedIn();
  const router = useRouter();
  const [fakeId, setFakeId] = useState('1234');
  const returnBackUrl = router.query.target as string;

  return (
    <MainLayout>
      <br />
      <Box sx={{ mx: '20px' }}>
        <Box sx={{ m: 'auto', maxWidth: '550px', backgroundColor: BG_COLOR }}>
          <Box p="3rem" borderRadius="0.3rem" border="1px solid #dee2e6">
            <br />
            {!loggedIn && (
              <TextField
                label="FakeId"
                value={fakeId}
                onChange={(e) => setFakeId(e.target.value)}
                sx={{ my: '10px' }}
              />
            )}
            {loggedIn ? (
              <Button
                fullWidth
                variant="contained"
                size="large"
                sx={{ w: '100%' }}
                onClick={() => logout()}
              >
                Logout
              </Button>
            ) : (
              <>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ fontSize: '32x' }}
                  onClick={() => {
                    if (fakeId) fakeLoginUsingRedirect(fakeId, returnBackUrl);
                    else loginUsingRedirect(returnBackUrl);
                  }}
                >
                  Login through FAU IdM-Portal
                </Button>
                <span
                  style={{
                    fontFamily: 'Roboto',
                    color: '#888',
                    marginTop: '10px',
                  }}
                >
                  <hr />
                  Please remember to logout after you are done.
                  <br />
                  <br />
                  <i style={{ color: 'red' }}>
                    Warning: Logging out from FAU IdM-Portal will NOT log you
                    out here.
                  </i>
                </span>
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
