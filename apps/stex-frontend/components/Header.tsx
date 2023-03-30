import { useMatomo } from '@jonkoops/matomo-tracker-react';
import HelpIcon from '@mui/icons-material/Help';
import NotificationsIcon from '@mui/icons-material/Notifications';
import WarningIcon from '@mui/icons-material/Warning';
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import AppBar from '@mui/material/AppBar';
import { getUserInfo, isLoggedIn, logout } from '@stex-react/api';
import { CountryFlag, DateView } from '@stex-react/react-utils';
import { localStore } from '@stex-react/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { BrowserAutocomplete } from '../components/BrowserAutocomplete';
import { getLocaleObject } from '../lang/utils';
import styles from '../styles/header.module.scss';
import { SYSTEM_UPDATES } from '../system-updates';

function UserButton() {
  const router = useRouter();
  const { header: t } = getLocaleObject(router);

  // Menu crap Start
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  // Menu crap End

  const [userName, setUserName] = useState('User');
  const { pushInstruction } = useMatomo();

  useEffect(() => {
    getUserInfo().then((userInfo) => {
      if (!userInfo) return;
      setUserName(userInfo.givenName);
      pushInstruction('setUserId', userInfo.userId);
    });
  }, []);

  return (
    <Box whiteSpace="nowrap">
      <Button
        sx={{
          color: 'white',
          border: '1px solid white',
          textTransform: 'none',
        }}
        onClick={handleClick}
      >
        {userName}
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem
          onClick={() => {
            router.push('/my-profile');
            handleClose();
          }}
        >
          {t.profile}
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            logout();
          }}
        >
          {t.logOut}
        </MenuItem>
      </Menu>
    </Box>
  );
}

function LanguageButton() {
  const router = useRouter();
  const { locale } = router;

  // Menu crap Start
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  // Menu crap End

  function changeLocale(locale: string) {
    const { pathname, asPath, query } = router;
    // change just the locale and maintain all other route information including href's query
    router.push({ pathname, query }, asPath, { locale });
  }
  return (
    <Box whiteSpace="nowrap">
      <IconButton onClick={handleClick}>
        <CountryFlag
          flag={locale === 'en' ? 'gb' : locale}
          size="28x21"
          size2="56x42"
        />
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem
          onClick={() => {
            changeLocale('en');
            handleClose();
          }}
        >
          <CountryFlag flag="gb" size="28x21" size2="56x42" />
          &nbsp; English
        </MenuItem>
        <MenuItem
          onClick={() => {
            changeLocale('de');
            handleClose();
          }}
        >
          <CountryFlag flag="de" size="28x21" size2="56x42" />
          &nbsp; Deutsch
        </MenuItem>
      </Menu>
    </Box>
  );
}

function NotificationButton() {
  const router = useRouter();
  const { header: t } = getLocaleObject(router);

  // System info menu crap start
  const [anchorEl, setAnchorEl] = useState<any>(null);
  const open = Boolean(anchorEl);
  const handleClose = () => setAnchorEl(null);
  // System info menu crap end
  return (
    <>
      <Tooltip title={t.systemUpdate}>
        <IconButton
          onClick={(e) => {
            setAnchorEl(e.currentTarget);
            localStore?.setItem('top-system-update', SYSTEM_UPDATES[0].id);
          }}
        >
          <NotificationsIcon htmlColor="white" />
        </IconButton>
      </Tooltip>

      {localStore?.getItem('top-system-update') !== SYSTEM_UPDATES[0].id && (
        <div
          style={{
            color: 'red',
            position: 'absolute',
            left: '20px',
            top: '-2px',
            fontSize: '30px',
          }}
        >
          &#8226;
        </div>
      )}
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {SYSTEM_UPDATES.slice(0, 9).map((update, idx) => (
          <MenuItem key={idx} onClick={handleClose}>
            <Link href={`/updates#${update.id}`}>
              <Box>
                {update.header}
                <Typography display="block" variant="body2" color="gray">
                  <DateView
                    timestampMs={update.timestamp.unix() * 1000}
                    style={{ fontSize: '14px' }}
                  />
                </Typography>
              </Box>
            </Link>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export function Header({
  showBrowserAutocomplete,
}: {
  showBrowserAutocomplete: boolean;
}) {
  const loggedIn = isLoggedIn();
  const router = useRouter();
  const { header: t } = getLocaleObject(router);

  return (
    <AppBar position="static">
      <Toolbar className={styles['toolbar']}>
        <Link href="/" passHref>
          <Tooltip title={t.headerWarning}>
            <Box display="flex" flexWrap="nowrap" alignItems="baseline">
              <Image
                src="/voll-ki-courses.svg"
                alt="VoLL-KI Logo"
                width={128}
                height={40}
                style={{ cursor: 'pointer' }}
              />
              <WarningIcon
                fontSize="large"
                sx={{ cursor: 'pointer', color: '#e20' }}
              />
            </Box>
          </Tooltip>
        </Link>
        {showBrowserAutocomplete && (
          <Box sx={{ mx: '40px', maxWidth: '600px' }} flex="1">
            <BrowserAutocomplete />
          </Box>
        )}
        <Box>
          <Box display="flex" alignItems="center">
            <NotificationButton />
            <Link href="/help">
              <IconButton>
                <Tooltip title={t.helpCenter}>
                  <HelpIcon htmlColor="white" />
                </Tooltip>
              </IconButton>
            </Link>
            <LanguageButton />
            {loggedIn ? (
              <UserButton />
            ) : (
              <Button
                sx={{ color: 'white', border: '1px solid white' }}
                onClick={() => {
                  // Don't change target when user reclicks 'Login' button.
                  if (window.location.pathname === '/login') return;
                  router.push(
                    '/login?target=' + encodeURIComponent(window.location.href)
                  );
                }}
              >
                {t.login}
              </Button>
            )}
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
