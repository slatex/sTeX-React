import dayjs from 'dayjs';
export const SYSTEM_UPDATES = [
  /*{
    id: '',
    header: '',
    content: '',
    header_de: '',
    content_de: '',
    timestamp: dayjs('2023-02-11T00:20:00+05:30'),
  },*/
  {
    id: 'competency_indicator',
    header: 'Competency Indicator',
    content:
      'Now you can track your progress and master various concepts directly within our course notes. Your journey to competency just got even more insightful. Explore, learn, and watch your understanding grow! 🚀',
    header_de: 'Kompetenzanzeiger',
    content_de:
      'Jetzt können Sie Ihren Fortschritt verfolgen und verschiedene Konzepte direkt in unseren Kursunterlagen beherrschen. Ihre Reise zur Kompetenz ist jetzt noch aufschlussreicher. Entdecken Sie, lernen Sie und sehen Sie zu, wie Ihr Verständnis wächst! 🚀',
    timestamp: dayjs('2023-11-02T00:20:00+05:30'),
  },
  {
    id: 'quizzes',
    header: 'Quizzes in ALeA',
    content:
      'We are pleased to announce the introduction of our new Quiz Feature on our ALeA! We will be utilizing this feature for the weekly quizzes in the AI-1 course conducted during lectures. To stay informed about upcoming quizzes, kindly visit the [quiz dashboard](https://courses.voll-ki.fau.de/quiz-dash/ai-1).',
    header_de: 'Quizze in ALeA',
    content_de:
      'Wir freuen uns, die Einführung unseres neuen Quiz-Features auf unserem ALeA bekannt zu geben! Wir werden diese Funktion für die wöchentlichen Tests im AI-1-Kurs nutzen, die während der Vorlesungen durchgeführt werden. Um über bevorstehende Quizze auf dem Laufenden zu bleiben, besuchen Sie bitte das [Quiz-Dashboard](https://courses.voll-ki.fau.de/quiz-dash/ai-1).',
    timestamp: dayjs('2023-10-11T20:40:00+05:30'),
  },
  {
    id: 'badges',
    header: 'Good deeds create positive karma.',
    content:
      'In the spirit of collaborative knowledge exchange, we have introduced our karma system. Ask questions, answer them, report errors, or provide clarifications - and earn karma points and badges along the way.  Every contribution counts, and together we can create a thriving community of learners.',
    header_de: 'Gute Taten schaffen positives Karma.',
    content_de:
      'Im Sinne des gemeinschaftlichen Wissensaustausches haben wir unser Karma-System eingeführt. Stellen Sie Fragen, beantworten Sie sie, melden Sie Fehler oder geben Sie Erläuterungen – und sammeln Sie nebenbei Karma-Punkte und Abzeichen. Jeder Beitrag zählt, und gemeinsam können wir eine lebendige Lerngemeinschaft schaffen.',
    timestamp: dayjs('2023-06-14T19:20:00+05:30'),
  },
  {
    id: 'course-descriptions',
    header: 'Course Descriptions',
    content: 'Home pages of courses now show a description of the course.',
    header_de: 'Kursbeschreibungen',
    content_de:
      'Startseiten von Kursen zeigen jetzt eine Beschreibung des Kurses.',
    timestamp: dayjs('2023-06-13T19:20:00+05:30'),
  },
  {
    id: 'course-forums',
    header: 'Course Forums',
    content:
      'You can now ask questions and participate in course forums. Check out the forum page for [Artificial Intelligence - 2](/forum/ai-2).',
    header_de: 'Kursforen',
    content_de:
      'Sie können jetzt Fragen stellen und an Kursforen teilnehmen. Schauen Sie sich die Forumseite für [Artificial Intelligence - 2](/forum/ai-2) an.',
    timestamp: dayjs('2023-05-26T18:00:00+05:30'),
  },
  {
    id: 'cards-with-sections',
    header: 'Flash Cards arranged by sections',
    content: 'Flash cards can now be browsed by course section.',
    header_de: 'Lernkarten nach Abschnitten geordnet',
    content_de:
      'Lernkarten können jetzt nach Kursabschnitten durchsucht werden.',
    timestamp: dayjs('2023-05-10T21:50:00+05:30'),
  },
  {
    id: 'recorded-syllabus',
    header: 'Recorded Syllabus on course home page',
    content:
      'You can now see what sections have been covered in class on the course home page. You can also easily access the lecture videos.',
    header_de: 'Aufgezeichneter Lehrplan auf der Kurs-Homepage',
    content_de:
      'Auf der Startseite des Kurses können Sie jetzt sehen, welche Abschnitte im Unterricht behandelt wurden. Sie können auch problemlos auf die Vorlesungsvideos zugreifen.',
    timestamp: dayjs('2023-05-09T22:10:00+05:30'),
  },
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
