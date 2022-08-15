import { Box, Toolbar } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Link from 'next/link';
import { BrowserAutocomplete } from '../components/BrowserAutocomplete';
import styles from '../styles/header.module.scss';

export function Header({
  showBrowserAutocomplete,
}: {
  showBrowserAutocomplete: boolean;
}) {
  return (
    <AppBar position="static">
      <Toolbar className={styles['toolbar']}>
        <Link href="/">
          <span className={styles['toolbar_logo']}>VoLL-KI</span>
        </Link>
        {showBrowserAutocomplete && (
          <Box sx={{ mx: '40px', maxWidth: '600px' }} flex="1">
            <BrowserAutocomplete />
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
