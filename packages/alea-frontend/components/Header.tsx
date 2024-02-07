import { useMatomo } from '@jonkoops/matomo-tracker-react';
import HelpIcon from '@mui/icons-material/Help';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import WarningIcon from '@mui/icons-material/Warning';
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
} from '@mui/material';
import AppBar from '@mui/material/AppBar';
import { getUserInfo, isLoggedIn, logout } from '@stex-react/api';
import { CountryFlag, useScrollDirection } from '@stex-react/react-utils';
import { localStore } from '@stex-react/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { BrowserAutocomplete } from '../components/BrowserAutocomplete';
import { getLocaleObject } from '../lang/utils';
import styles from '../styles/header.module.scss';
import NotificationButton from './NotificationButton';

export const HIDE_BANNER_ITEM = 'hide-survey-banner';

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
          color: 'black',
          border: '1px solid black',
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

  function changeLocale(locale: string) {
    const { pathname, asPath, query } = router;
    // change just the locale and maintain all other route information including href's query
    router.replace({ pathname, query }, asPath, { locale });
  }
  return (
    <Box whiteSpace="nowrap">
      <Tooltip title={t.changeLanguage}>
        <IconButton onClick={handleClick}>
          <CountryFlag
            flag={locale === 'en' ? 'gb' : locale}
            size="28x21"
            size2="56x42"
          />
        </IconButton>
      </Tooltip>
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

export function Header({
  showBrowserAutocomplete,
}: {
  showBrowserAutocomplete: boolean;
}) {
  const loggedIn = isLoggedIn();
  const router = useRouter();
  const { header: t } = getLocaleObject(router);
  const [surveyShown, setSurveyShown] = useState(
    !localStore?.getItem(HIDE_BANNER_ITEM) ?? true
  );
  const background =
    process.env.NEXT_PUBLIC_SITE_VERSION === 'production'
      ? undefined
      : process.env.NEXT_PUBLIC_SITE_VERSION === 'staging'
      ? 'crimson !important'
      : 'blue !important';
  const scrollDirection = useScrollDirection();
  const forceShowBar =
    scrollDirection === 'up' && router.asPath.includes('course-notes');

  return (
    <AppBar
      position="sticky"
      sx={{
        top: forceShowBar ? '0' : '-120px',
        transition: 'top 0.4s ease-out',
      }}
    >
      <Toolbar className={styles['toolbar']} sx={{ background }}>
        <Link href="/" passHref>
          <Tooltip title={t.headerWarning}>
            <Box display="flex" flexWrap="nowrap" alignItems="center">
              <Image
                src="/alea-logo.svg"
                alt="ALeA Logo"
                width={99}
                height={64}
                style={{ cursor: 'pointer' }}
                priority={true}
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
            <Link href="/help" tabIndex={-1}>
              <Tooltip title={t.helpCenter}>
                <IconButton>
                  <HelpIcon htmlColor="white" />
                </IconButton>
              </Tooltip>
            </Link>
            <LanguageButton />
            {loggedIn ? (
              <UserButton />
            ) : (
              <Button
                sx={{ color: 'black', border: '1px solid black' }}
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

      {surveyShown && (
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            background: 'beige',
            color: '#333',
          }}
          variant="dense"
        >
          <Box>
            Help us to evaluate ALeA by participating in this study! ➡️{' '}
            <Link
              href="https://ddi-survey.cs.fau.de/limesurvey/ALeA"
              style={{ display: 'inline' }}
            >
              <b>
                <u>Click Here</u>
              </b>
            </Link>
            .
          </Box>
          <Tooltip title="Dismiss">
            <IconButton
              onClick={() => {
                setSurveyShown(false);
                localStore?.setItem(HIDE_BANNER_ITEM, 'hide');
              }}
              sx={{ p: '5px' }}
            >
              <HighlightOffIcon fontSize="large" />
            </IconButton>
          </Tooltip>
        </Toolbar>
      )}
    </AppBar>
  );
}
