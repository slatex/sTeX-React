import { useMatomo } from '@jonkoops/matomo-tracker-react';
import { Box, Toolbar } from '@mui/material';
import { ReportProblemPopover } from '@stex-react/report-a-problem';
import { PRIMARY_COL, SECONDARY_COL } from '@stex-react/utils';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { getLocaleObject } from '../lang/utils';

export default function MainLayout({
  title,
  children,
  showBrowserAutocomplete = false,
}: {
  title?: string;
  children: any;
  showBrowserAutocomplete?: boolean;
}) {
  const { trackPageView } = useMatomo();
  const router = useRouter();
  const { header: t } = getLocaleObject(router);
  const [prevLoc, setPrevLoc] = useState('');

  useEffect(() => {
    const loc = router.asPath;
    if (!router.isReady || prevLoc === loc) return;
    trackPageView();
    setPrevLoc(loc);
  }, [router.isReady, router.asPath]);

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
        {/*<Typography
          sx={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }}
        >
          Unfortunately, the login facility of website is not working. We are
          working to get it resolved and apologize for the inconvenience.
        </Typography>*/}
        <Box>{children}</Box>
      </main>
      <footer id="footer">
        <Toolbar
          variant="dense"
          sx={{
            mt: '10px',
            background: PRIMARY_COL,
            color: SECONDARY_COL,
            display: 'flex',
            flexDirection: 'row-reverse',
            fontFamily: '"Roboto"',
            zIndex: 1,
          }}
        >
          <Link href="/privacy">{t.privacyPolicy}</Link>
          <a
            target="_blank"
            rel="noreferrer"
            href="https://www.voll-ki.fau.de/impressum"
            style={{ marginRight: '10px' }}
          >
            {t.legalNotice}
          </a>
        </Toolbar>
      </footer>
    </Box>
  );
}
