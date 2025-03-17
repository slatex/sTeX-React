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

export default function JpLayout({
  title,
  children,
  bgColor,
  navbarActions,
}: {
  title?: string;
  children: any;
  bgColor?: string;
  navbarActions?: React.ReactNode;
}) {
  return (
    <Box minHeight="100vh" display="flex" flexDirection="column" bgcolor={bgColor}>
      <Head>
        <title>{title || 'Job-Portal'}</title>
        <meta name="description" content="VoLL-KI" />
        <link
          rel="icon"
          href="https://www.voll-ki.fau.de/wp-content/themes/FAU-Einrichtungen/img/socialmedia/favicon.ico"
        />
      </Head>

      <main style={{ flexGrow: 1 }}>
        {/* <Sidebar/> */}
        {/* <NavBar navbarActions={navbarActions} /> */}
        <Box>{children}</Box>
      </main>
    </Box>
  );
}
