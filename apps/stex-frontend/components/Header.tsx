import { useMatomo } from '@jonkoops/matomo-tracker-react';
import WarningIcon from '@mui/icons-material/Warning';
import { Box, Button, Menu, MenuItem, Toolbar, Tooltip } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import { getUserInfo, isLoggedIn, logout, UserInfo } from '@stex-react/api';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { BrowserAutocomplete } from '../components/BrowserAutocomplete';
import styles from '../styles/header.module.scss';

const HEADER_WARNING =
  'WARNING: Research Prototype, it may misbehave, crash, delete data, ... or even make you happy without warning at any time!';
function UserButton() {
  const router = useRouter();
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
      setUserName(userInfo.givenName);
      pushInstruction('setUserId', userInfo.userId);
    });
  }, []);

  return (
    <div>
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
          Profile
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            logout();
          }}
        >
          Log out
        </MenuItem>
      </Menu>
    </div>
  );
}

export function Header({
  showBrowserAutocomplete,
}: {
  showBrowserAutocomplete: boolean;
}) {
  const loggedIn = isLoggedIn();
  const router = useRouter();
  return (
    <AppBar position="static">
      <Toolbar className={styles['toolbar']}>
        <Link href="/" passHref>
          <Tooltip title={HEADER_WARNING}>
            <Box>
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
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
