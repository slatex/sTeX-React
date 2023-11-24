import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
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
import Link from 'next/link';
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
          <TimelineItem
            key={item.postedTimestamp}
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <TimelineOppositeContent color="textSecondary">
              <DateView
                timestampMs={new Date(item.postedTimestamp)?.getTime()}
                style={{ fontSize: '14px' }}
              />
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot color="primary">
                {item.notificationType === 'SYSTEM' ? (
                  <DisplaySettingsIcon />
                ) : (
                  <QuestionAnswerIcon />
                )}
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Link href={item.link}>{item.header.toUpperCase()}</Link>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </MainLayout>
  );
};

export default AllNotificationPage;
