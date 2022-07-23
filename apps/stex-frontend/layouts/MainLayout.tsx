import { Box, Toolbar } from '@mui/material';
import { ReportProblemPopover } from '@stex-react/report-a-problem';
import Head from 'next/head';
import Link from 'next/link';
import { BrowserAutocomplete } from '../components/BrowserAutocomplete';

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
    <div>
      <Head>
        <title>{title || 'sTeX Documents'}</title>
        <meta name="description" content="VoLL-KI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Toolbar className="toolbar">
          <Link href="/">
            <span className="toolbar_logo">
              VoLL-KI
            </span>
          </Link>
          {showBrowserAutocomplete && (
            <Box sx={{ mx: '40px' }} flex="1">
              <BrowserAutocomplete />
            </Box>
          )}
        </Toolbar>
        <ReportProblemPopover />
        <Box sx={{ mt: `64px` }}>{children}</Box>
      </main>
    </div>
  );
}
