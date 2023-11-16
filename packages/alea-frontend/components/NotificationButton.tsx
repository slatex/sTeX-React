import NotificationsIcon from '@mui/icons-material/Notifications';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import { DateView } from '@stex-react/react-utils';
import { localStore } from '@stex-react/utils';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getLocaleObject } from '../lang/utils';
import { SYSTEM_UPDATES } from '../system-updates';
import axios from 'axios';
import { getAuthHeaders } from '@stex-react/api';

function NotificationButton() {
  const router = useRouter();
  const { locale } = router;
  const { header: t } = getLocaleObject(router);
  const [notifications, setNotifications] = useState(null);
  // System info menu crap start
  const [anchorEl, setAnchorEl] = useState<any>(null);
  const open = Boolean(anchorEl);
  const handleClose = () => setAnchorEl(null);
  // System info menu crap end
  useEffect(() => {
    axios.get('/api/get-user-notifications',{headers:getAuthHeaders()}).then((response) => {
      setNotifications(response.data);
    });
  }, []);
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
        {notifications
          ? notifications.map((notification, idx) => (
              <MenuItem key={idx}>
                <Box>
                  <Box>{notification.header}</Box>
                  <Typography display="block" variant="body2" color="gray">
                    <DateView
                      timestampMs={notification.postedTimestamp}
                      style={{ fontSize: '14px' }}
                    />
                  </Typography>
                </Box>
              </MenuItem>
            ))
          : null}
        {SYSTEM_UPDATES.slice(0, 9).map((update, idx) => (
          <MenuItem key={idx} onClick={handleClose}>
            <Link href={`/updates#${update.id}`}>
              <Box>
                {(locale === 'de' ? update.header_de : undefined) ??
                  update.header}
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

export default NotificationButton;
