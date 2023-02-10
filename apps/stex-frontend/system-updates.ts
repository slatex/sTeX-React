import dayjs from 'dayjs';
export const SYSTEM_UPDATES = [
  {
    id: 'feb-week-2-lectures',
    header: 'AI-1 slides/videos updated',
    content:
      'Videos and slides for the final (Feb 8th and 9th) AI-1 lectures are now available.',
    timestamp: dayjs('2023-02-11T00:20:00+05:30'),
  },
  {
    id: 'login-fixed',
    header: 'Login issues fixed',
    content:
      'Many users were unable to login to our system using their IdM ' +
      'credentials since Tuesday afternoon. This was caused because of the '+
      'changes we were making to support wider access via EduGain. This ' +
      'issue is now resolved.',
    timestamp: dayjs('2023-02-10T14:00:00+05:30'),
  },
  {
    id: 'feb-week-1-lectures',
    header: 'AI-1 slides/videos updated',
    content:
      'Videos and slides for the last two lectures (Feb 1st and 2nd) are now available.',
    timestamp: dayjs('2023-02-04T21:45:00+05:30'),
  },
  {
    id: 'quiz-demo',
    header: 'Quiz demo is functional again',
    content:
      '...but only on the [staging server](https://courses-staging.kwarc.info/quiz).',
    timestamp: dayjs('2023-02-01T23:45:00+05:30'),
  },
  {
    id: 'flash-card-tweaks',
    header: 'Flash cards interface improved',
    content: `- Early cancel from a drill also shows summary page
- Learners can have drill cards shuffled
- Helper text introducing flash cards
- Wider cards on bigger screens
- Default configurator level set to "I'm not sure"`,
    timestamp: dayjs('2023-02-01T16:00:00+05:30'),
  },
];
