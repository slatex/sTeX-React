import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Notification,
  NotificationType,
  getUserNotifications,
} from '@stex-react/api';
import { DateView } from '@stex-react/react-utils';
import { localStore } from '@stex-react/utils';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getLocaleObject } from '../lang/utils';
import { SYSTEM_UPDATES } from '../system-updates';
export function changeSystemUpdateToNotification(
  systemUpdate,
  locale
): Notification {
  const { content, header, content_de, header_de, postedTimestamp } =
    systemUpdate;
  return {
    userId: '',
    postedTimestamp,
    link: `/updates#${systemUpdate.id}`,
    content: (locale === 'de' ? content_de : content) ?? content,
    header: (locale === 'de' ? header_de : header) ?? header,
    notificationType: NotificationType.SYSTEM,
  };
}

export function useNotificationData() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const locale = useRouter().locale || 'en';
  useEffect(() => {
    getUserNotifications(locale).then(setNotifications);
  }, [locale]);

  const allItems = [
    ...notifications,
    ...SYSTEM_UPDATES.map((update) =>
      changeSystemUpdateToNotification(update, locale)
    ),
  ];

  const sortedItems = allItems.sort((a, b) => {
    const timestampA = new Date(a.postedTimestamp)?.getTime() || 0;
    const timestampB = new Date(b.postedTimestamp)?.getTime() || 0;
    return timestampB - timestampA;
  });
  return sortedItems;
}

function NotificationButton() {
  const router = useRouter();
  const { header: t, notification: n } = getLocaleObject(router);
  // System info menu crap start
  const [anchorEl, setAnchorEl] = useState<any>(null);
  const open = Boolean(anchorEl);
  const handleClose = () => setAnchorEl(null);
  // System info menu crap end

  const sortedItems = useNotificationData();
  function topUpdate() {
    const timestamp = sortedItems[0]
      ? Math.floor(new Date(sortedItems[0].postedTimestamp).getTime() / 1000)
      : null;
    return timestamp?.toString();
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
            <Link href={item.link}>
              <Box display="flex" alignItems="center">
                <Box marginRight="1vw">
                  {item.notificationType === 'SYSTEM' ? (
                    <DisplaySettingsIcon style={{ color: 'rgb(32, 51, 96)' }} />
                  ) : (
                    <QuestionAnswerIcon style={{ color: 'rgb(32, 51, 96)' }} />
                  )}
                </Box>
                <Box>
                  {item.header}
                  <Typography display="block" variant="body2" color="gray">
                    <DateView
                      timestampMs={new Date(item.postedTimestamp)?.getTime()}
                      style={{ fontSize: '14px' }}
                    />
                  </Typography>
                </Box>
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
              {n.allNotification}
            </Typography>
          </Link>
        </Box>
      </Menu>
    </>
  );
}

export default NotificationButton;
