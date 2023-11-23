import Timeline from '@mui/lab/Timeline';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineOppositeContent, {
  timelineOppositeContentClasses,
} from '@mui/lab/TimelineOppositeContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import { DateView } from '@stex-react/react-utils';
import type { NextPage } from 'next';
import { useNotificationData } from '../components/NotificationButton';
import MainLayout from '../layouts/MainLayout';
const AllNotificationPage: NextPage = () => {
  const sortedItems = useNotificationData();
  return (
    <MainLayout title="All Notifications | VoLL-KI">
      <Timeline
        sx={{
          [`& .${timelineOppositeContentClasses.root}`]: {
            flex: 0.2,
          },
        }}
      >
        {sortedItems.map((item) => (
          <TimelineItem key={item.id}>
            <TimelineOppositeContent color="textSecondary">
              <DateView
                timestampMs={
                  item.type === 'systemUpdate'
                    ? item.timestamp.unix() * 1000
                    : item.postedTimestamp
                }
                style={{ fontSize: '14px' }}
              />
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot color="primary" />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>{item.header.toUpperCase()}</TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </MainLayout>
  );
};

export default AllNotificationPage;
