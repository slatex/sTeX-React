import NotificationsIcon from '@mui/icons-material/Notifications';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import { getUserNotifications } from '@stex-react/api';
import { DateView } from '@stex-react/react-utils';
import { localStore } from '@stex-react/utils';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getLocaleObject } from '../lang/utils';
import { SYSTEM_UPDATES } from '../system-updates';

export function useNotificationData() {
  const [notifications, setNotifications] = useState(null);
  useEffect(() => {
    getUserNotifications().then(setNotifications);
  }, []);

  const allItems = [
    ...(notifications || []),
    ...SYSTEM_UPDATES.map((update) => ({
      ...update,
      type: 'systemUpdate',
    })),
  ];

  const sortedItems = allItems.sort((a, b) => {
    const timestampA =
      new Date(a.timestamp)?.getTime() ||
      new Date(a.postedTimestamp)?.getTime() ||
      0;
    const timestampB =
      new Date(b.timestamp)?.getTime() ||
      new Date(b.postedTimestamp)?.getTime() ||
      0;
    return timestampB - timestampA;
  });
  return sortedItems;
}

function NotificationButton() {
  const router = useRouter();
  const { locale } = router;
  const { header: t } = getLocaleObject(router);
  // System info menu crap start
  const [anchorEl, setAnchorEl] = useState<any>(null);
  const open = Boolean(anchorEl);
  const handleClose = () => setAnchorEl(null);
  // System info menu crap end

  const sortedItems = useNotificationData();
  function topUpdate() {
    return (sortedItems[0].updateId || sortedItems[0].id).toString();
  }
  return (
    <>
      <Tooltip title={t.systemUpdate}>
        <IconButton
          onClick={(e) => {
            setAnchorEl(e.currentTarget);
            localStore?.setItem('combined-top-update', topUpdate());
          }}
        >
          <NotificationsIcon htmlColor="white" />
        </IconButton>
      </Tooltip>

      {localStore?.getItem('combined-top-update') !== topUpdate() && (
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
        {sortedItems.slice(0, 7).map((item, idx) => (
          <MenuItem key={idx} onClick={handleClose}>
            <Link
              href={item.type === 'systemUpdate' ? `/updates#${item.id}` : '#'}
            >
              <Box>
                {(item.type === 'systemUpdate' &&
                  (locale === 'de' ? item.header_de : undefined)) ||
                  item.header}
                <Typography display="block" variant="body2" color="gray">
                  <DateView
                    timestampMs={
                      item.type === 'systemUpdate'
                        ? item.timestamp.unix() * 1000
                        : item.postedTimestamp
                    }
                    style={{ fontSize: '14px' }}
                  />
                </Typography>
              </Box>
            </Link>
          </MenuItem>
        ))}
        <Box
          textAlign="center"
          style={{ backgroundColor: 'rgb(32, 51, 96)', padding: '8px' }}
        >
          <Link href="/all-notification">
            <Typography style={{ color: 'white' }}>
              See All Notifications
            </Typography>
          </Link>
        </Box>
      </Menu>
    </>
  );
}

export default NotificationButton;
