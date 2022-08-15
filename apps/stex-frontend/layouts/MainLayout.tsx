import { Box } from '@mui/material';
import { ReportProblemPopover } from '@stex-react/report-a-problem';
import Head from 'next/head';
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
    <div>
      <Head>
        <title>{title || 'sTeX Documents'}</title>
        <meta name="description" content="VoLL-KI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header showBrowserAutocomplete={showBrowserAutocomplete} />
        <ReportProblemPopover />
        <Box>{children}</Box>
      </main>
    </div>
  );
}
