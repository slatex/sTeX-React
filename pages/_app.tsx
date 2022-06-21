import '../styles/globals.scss'
import type { AppProps } from 'next/app'
import { createTheme } from '@mui/material';
import { ThemeProvider } from '@emotion/react';


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

function MyApp({ Component, pageProps }: AppProps) {
  return <ThemeProvider theme={theme}> <Component {...pageProps} /></ThemeProvider>;
}

export default MyApp
