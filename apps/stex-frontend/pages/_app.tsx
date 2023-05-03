import { createInstance, MatomoProvider } from '@jonkoops/matomo-tracker-react';
import { createTheme, ThemeProvider } from '@mui/material';
import { MathJaxContext } from '@stex-react/mathjax';
import { ServerLinksContext, setSectionIds } from '@stex-react/stex-react-renderer';
import { PRIMARY_COL, SECONDARY_COL } from '@stex-react/utils';
import axios from 'axios';
import { AppProps } from 'next/app';
import { useEffect } from 'react';
import './styles.scss';

/*const instance = createInstance({
  urlBase: 'https://matomo.kwarc.info',
  siteId: 1,
  // userId: 'UID76903202', optional, default value: `undefined`.
  // trackerUrl: 'https://matomo.kwarc.info/index.php',// optional, default value: `${urlBase}matomo.php`
  // srcUrl: 'https://matomo.kwarc.info/tracking.js', optional, default value: `${urlBase}matomo.js`
  disabled: false, // optional, false by default. Makes all tracking calls no-ops if set to true.
  // heartBeat: {
  // optional, enabled by default
  // active: true, optional, default value: true
  // seconds: 10, optional, default value: `15
  //},
  // linkTracking: false, optional, default value: true
  configurations: {
    // optional, default value: {}
    // any valid matomo configuration, all below are optional
    disableCookies: true,
    setSecureCookie: true,
    setRequestMethod: 'POST',
  },
});*/

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 450,
      md: 800,
      lg: 1200,
      xl: 1536,
    },
  },
  palette: {
    primary: {
      main: PRIMARY_COL,
    },
    secondary: {
      main: SECONDARY_COL,
    },
  },
});

function CustomApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    axios.get(`/api/get-section-ids`).then((r) => {
      setSectionIds(r.data);
    });
  });
  return (
    <ServerLinksContext.Provider
      value={{
        mmtUrl: process.env.NEXT_PUBLIC_MMT_URL,
        lmsUrl: process.env.NEXT_PUBLIC_LMS_URL,
      }}
    >
      {/*<MatomoProvider value={instance}>*/}
        <ThemeProvider theme={theme}>
          <MathJaxContext>
            <Component {...pageProps} />
          </MathJaxContext>
        </ThemeProvider>
      {/*</MatomoProvider>*/}
    </ServerLinksContext.Provider>
  );
}

export default CustomApp;
