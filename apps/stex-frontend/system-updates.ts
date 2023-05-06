import dayjs from 'dayjs';
export const SYSTEM_UPDATES = [
  /*{
    id: '',
    header: '',
    content: '',
    timestamp: dayjs('2023-02-11T00:20:00+05:30'),
  },*/
  {
    id: 'course-slides',
    header: 'Course Slides Are Back!',
    content:
      'Course materials are now available for all courses in the form of slides. Click "slides" to check them out.',
    header_de: 'Kursfolien sind zurück!',
    content_de:
      'Für alle Kurse stehen jetzt Kursunterlagen in Form von Folien zur Verfügung. Klicken Sie auf "Folien", um sie anzusehen.',
    timestamp: dayjs('2023-05-06T17:40:00+05:30'),
  },
  {
    id: 'course-progress',
    header: 'Course Progress Indicator',
    content:
      'The table of contents in course notes and slides now indicates which sections have been covered in class. The sections that have been covered are shown with a yellow background.',
    header_de: 'Kursfortschrittsanzeige',
    content_de:
      'Das Inhaltsverzeichnis in Kursnotizen und Folien zeigt jetzt an, welche Abschnitte im Kurs behandelt wurden. Die abgedeckten Abschnitte werden mit einem gelben Hintergrund angezeigt.',
    timestamp: dayjs('2023-04-27T14:20:00+05:30'),
  },
  {
    id: 'course-home',
    header: 'Course Home Pages',
    content:
      'Each course will now have a dedicated home page which will eventually lead you to notes, slides, flash cards, forums and everything else you need. Checkout [AI-2 course home page](/course-home/ai-2).',
    timestamp: dayjs('2023-04-25T16:00:00+05:30'),
  },
  {
    id: 'quiz-update',
    header: 'Improved Quizzes',
    content:
      'We have significatly improved the user experience of taking a quiz. We also support more question types. See [demo](/quiz). The demo also has the ability to store timing information that can be viewed [here](/quiz/results).',
    timestamp: dayjs('2023-04-13T11:30:00+05:30'),
  },
  {
    id: 'pp-guided-tour',
    header: 'Paper Prototype: Guided Tour',
    content:
      'A [paper prototype](/exp/pp_dialogue_tour) to show how a conversational UI would work in ALeA.',
    timestamp: dayjs('2023-04-02T18:30:00+05:30'),
  },
  {
    id: 'pp-students',
    header: 'Paper Prototype: Course Progress',
    content:
      'A [paper prototype](/exp/pp_students) that shows students their progress in a course.',
    timestamp: dayjs('2023-04-02T18:00:00+05:30'),
  },
  {
    id: 'localization',
    header: 'Now available in German!',
    content:
      'This portal can now be viewed in German. Click on the country flag on the header to switch between English and German.',
    header_de: 'Jetzt auf Deutsch verfügbar!',
    content_de:
      'Dieses Portal ist nun auch auf Deutsch zu sehen. Klicken Sie auf die Länderflagge in der Kopfzeile, um zwischen Englisch und Deutsch zu wechseln.',
    timestamp: dayjs('2023-03-30T16:00:00+05:30'),
  },
  {
    id: 'pp-learning-progress',
    header: 'Paper Prototype: Learning progress',
    content:
      'A [paper prototype](/exp/pp_teachers_and_tas) to show how we might report course progress to educators.',
    timestamp: dayjs('2023-02-28T11:10:00+05:30'),
  },
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
      'credentials since Tuesday afternoon. This was caused because of the ' +
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
