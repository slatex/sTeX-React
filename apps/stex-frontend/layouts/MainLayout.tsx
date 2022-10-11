import { Box, Toolbar } from '@mui/material';
import { ReportProblemPopover } from '@stex-react/report-a-problem';
import Head from 'next/head';
import Link from 'next/link';
import { Header } from '../components/Header';

export default function MainLayout({
  title,
  children,
  showBrowserAutocomplete = false,
}: {
  title?: string;
  children: any;
  showBrowserAutocomplete?: boolean;
}) {
  return (
    <Box minHeight="100vh" display="flex" flexDirection="column">
      <Head>
        <title>{title || 'VoLL-KI'}</title>
        <meta name="description" content="VoLL-KI" />
        <link
          rel="icon"
          href="https://www.voll-ki.fau.de/wp-content/themes/FAU-Einrichtungen/img/socialmedia/favicon.ico"
        />
      </Head>

      <main style={{ flexGrow: 1 }}>
        <Header showBrowserAutocomplete={showBrowserAutocomplete} />
        <ReportProblemPopover />
        <Box>{children}</Box>
      </main>
      <footer id="footer">
        <Toolbar
          variant="dense"
          sx={{
            mt: '10px',
            background: '#203360',
            color: '#8c9fb1',
            display: 'flex',
            flexDirection: 'row-reverse',
            fontFamily: '"Roboto"',
            zIndex: 1,
          }}
        >
          <Link href="/privacy">Privacy Policy</Link>
          <a
            target="_blank"
            rel="noreferrer"
            href="https://www.voll-ki.fau.de/impressum"
            style={{ marginRight: '10px' }}
          >
            Legal Notice
          </a>
        </Toolbar>
      </footer>
    </Box>
  );
}
