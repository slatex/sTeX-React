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
import { getAuthHeaders, getNotification } from '@stex-react/api';

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
    getNotification().then(setNotifications);
  }, []);
  const allItems = [
    ...(notifications || []),
    ...SYSTEM_UPDATES.slice(0, 9).map((update) => ({
      ...update,
      type: 'systemUpdate',
    })),
  ];

  const sortedItems = allItems.sort((a, b) => {
    const timestampA = a.timestamp || a.postedTimestamp || 0;
    const timestampB = b.timestamp || b.postedTimestamp || 0;
    return timestampB - timestampA;
  });

  const renderDateView = (timestamp) => (
    <DateView timestampMs={timestamp} style={{ fontSize: '14px' }} />
  );

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
        {sortedItems.map((item, idx) => (
          <MenuItem key={idx} onClick={handleClose}>
            <Link
              href={item.type === 'systemUpdate' ? `/updates#${item.id}` : '#'}
            >
              <Box>
                {(item.type === 'systemUpdate' &&
                  (locale === 'de' ? item.header_de : undefined)) ||
                  item.header}
                <Typography display="block" variant="body2" color="gray">
                  {renderDateView(
                    item.type === 'systemUpdate'
                      ? item.timestamp.unix() * 1000
                      : item.postedTimestamp
                  )}
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
