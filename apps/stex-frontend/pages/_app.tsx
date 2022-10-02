import { createTheme, ThemeProvider } from '@mui/material';
import { MathJaxContext } from '@stex-react/stex-react-renderer';
import { DEFAULT_BASE_URL, IS_SERVER } from '@stex-react/utils';
import { AppProps } from 'next/app';
import { MatomoProvider, createInstance } from '@jonkoops/matomo-tracker-react';
import './styles.scss';

const instance = createInstance({
  urlBase: 'https://sp.kwarc.info',
  siteId: 1,
  // userId: 'UID76903202', optional, default value: `undefined`.
  trackerUrl: 'https://sp.kwarc.info/index.php',// optional, default value: `${urlBase}matomo.php`
  // srcUrl: 'https://sp.kwarc.info/tracking.js', optional, default value: `${urlBase}matomo.js`
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
});

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
      main: '#3f51b5',
    },
    secondary: {
      main: '#ffc107',
    },
  },
});

function CustomApp({ Component, pageProps }: AppProps) {
  if (!IS_SERVER) (window as any).BASE_URL = DEFAULT_BASE_URL;
  return (
    <MatomoProvider value={instance}>
      <ThemeProvider theme={theme}>
        <MathJaxContext>
          <Component {...pageProps} />
        </MathJaxContext>
      </ThemeProvider>
    </MatomoProvider>
  );
}

export default CustomApp;
