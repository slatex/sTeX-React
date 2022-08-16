import { createTheme, ThemeProvider } from '@mui/material';
import { MathJaxContext } from '@stex-react/stex-react-renderer';
import { DEFAULT_BASE_URL, IS_SERVER } from '@stex-react/utils';
import { AppProps } from 'next/app';
import './styles.scss';

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
    <ThemeProvider theme={theme}>
      <MathJaxContext>
        <Component {...pageProps} />
      </MathJaxContext>
    </ThemeProvider>
  );
}

export default CustomApp;
