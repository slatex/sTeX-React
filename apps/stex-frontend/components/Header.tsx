import { Box, Button, Menu, MenuItem, Toolbar } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { isLoggedIn, logout } from '../api/ums';
import { BrowserAutocomplete } from '../components/BrowserAutocomplete';
import styles from '../styles/header.module.scss';

function UserButton() {
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
  return (
    <div>
      <Button
        sx={{ color: 'white', border: '1px solid white' }}
        onClick={handleClick}
      >
        User
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
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
        <Link href="/">
          <span className={styles['toolbar_logo']}>VoLL-KI</span>
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
