export const de = {
  home: {
    header: 'VoLL-KI-basierte Kurse an der FAU',
    courseSection: 'Aktuelles Semester',
    otherCourses: 'Weitere Kurse',
    guidedTourHeader: 'Themenbezogen, Freestyle-Lernen',
    footerInfo:
      'Aktive Kursmaterialien beinhalten Lernunterstützungsdienste, die auf einem Modell basieren, das bei jeder Interaktion mit den Materialien aktualisiert wird. Solche Modelle der Vorlieben und Kompetenzen eines Nutzenden enthalten hochsensible personenbezogene Daten. Daher werden die Lernunterstützungsdienste (und die entsprechende Sammlung von Nutzendenmodelldaten) nur verwendet, wenn der oder die Nutzende über den Single-Signon-Dienst der FAU angemeldet ist, und werden sicher und unter ausschließlicher Kontrolle des jeweiligen Nutzenden in der Voll-KI Trust Zone gespeichert.',

    expIconHover1: 'Sehen Sie, was in unserem Labor braut.',
    expIconHover2: 'Äußerste Vorsicht walten lassen!',
    cardIntro:
      '"Flash Cards" unterstützen das Üben und Lernen der Konzepte ' +
      'des Kurses. Den Lernenden werden Karten mit Konzeptnamen gezeigt, ' +
      'die umgedreht werden können, um die Definition anzuzeigen. Die ' +
      'Lernenden bewerten ihre Konzeptwissen selbst, was uns hilft, ' +
      'die in Übungen gezeigten Karten zu anzupassen.',
    courseThumb: {
      notes: 'Skript',
      cards: 'Karten',
      slides: 'Folien',
      forum: 'Forum',
      quizzes: 'Quizze',
    },
  },
  login: {
    alreadyLoggedIn: 'Du bist bereits eingeloggt.',
    logout: 'Ausloggen',
    fauLogin: 'Anmeldung über das IdM-Portal der FAU',
    fakeLogin: 'Falsche Anmeldung',
    rememberLogout: 'Bitte denken Sie daran, sich nach Abschluss abzumelden.',
    logoutWarning:
      'Achtung: Durch das Abmelden vom FAU IdM-Portal werden Sie hier NICHT abgemeldet.',
    notesHeader:
      'Beachten Sie, dass Sie sich in einen Forschungsprototyp für individualisierte Lernunterstützung auf Universitätsebene einloggen. Bitte beachten Sie folgende Konsequenzen:',
    notesPoint1:
      'Dies ist kein fertiges System, daher können sich die Systemfunktionen ohne vorherige Ankündigung ändern oder verschwinden. Sie nehmen freiwillig an diesem experimentellen System teil, wir hoffen, dass das System Ihre Lernerfahrung und Ihren Erfolg verbessern wird. Es gibt jedoch keine Vorteile und/oder Unterschiede in der Art und Weise, wie Sie im Kurs benotet oder bewertet werden.',
    notesPoint2:
      'Das System sammelt personalisierte Daten über alle Ihre Interaktionen mit dem System, einschließlich Klick-/Hover-/Mausbewegungs-Streams, Seitenanfragen, Ergebnisse von Quiz usw. Das System verwendet diese Daten, um Lernkompetenzmodelle zu generieren, welche wiederum die angezeigten Kursmaterialien und die Interaktion mit dem System beeinflussen.',
    notesPoint3:
      'Beachten Sie, dass auf personalisierte Daten nur Accounts zugreifen können, die mit Ihren persönlichen IDM-Anmeldeinformationen authentifiziert sind. Insbesondere werden ohne Ihre Einwilligung keine personenbezogenen Daten aus dem System heraus übermittelt.',
    notesPoint4:
      'Das Forschungsprojekt VoLL-KI wird diese Daten in aggregierter, anonymisierter und/oder pseudonymisierter Form zur Evaluation des Systems und der zugrunde liegenden Methoden verwenden. Wir werden uns nach besten Kräften bemühen, sicherzustellen, dass personalisierte Daten nicht aus aggregierten Daten rekonstruiert werden können. Details zum KI-System finden Sie hier',
    guest: {
      encourage:
        'Während das VoLL-KI ALEA-System zunächst für Studierende der FAU gedacht ist, arbeiten wir daran, unser Angebot auf mehr Lernende auszudehnen. In der Zwischenzeit empfehlen wir Ihnen, sich als Gast anzumelden und das System zu testen.',
      entryButton: 'Gast-Login',
      chooseLearnerHelperText:
        'Die Inhalte der Plattform sind auf die Kompetenzen der Lernenden zugeschnitten. Bitte wählen Sie oben eine Beispiel-Person aus, um zu beginnen.',
      personaSelect: 'Wählen Sie eine Person',
      guestIdText: 'Gast-ID',
      guestNameText: 'Gast-Username',
      loginButton: 'Als Gast einloggen',
    },
  },
  flashCards: {
    header: 'Konfigurieren Sie Ihren Lernkartenstapel zum Lernen/Üben!',
    chooseCoverage: 'Wählen Sie ein Kartenset',
    chooseCoverageHover:
      'Wählen Sie die Karten im Stapel nach Kurskapiteln aus',
    chooseCompetency: 'Wählen Sie Kompetenzstufen',
    chooseCompetencyHover:
      'Wählen Sie die Kompetenzstufen (geschätzt durch das Lernendenmodell), bis zu denen Karten in den Kartenstapel aufgenommen werden sollen',
    chooseCompetencyDetails:
      'Die Auswahl legt alle Karten bis zur gewählten Kompetenzstufe auf den Stapel.',
    shuffleCards: 'Übungskarten mischen',
    revise: 'Wiederholen',
    drill: 'Lernen',
    concepts: 'Konzepte',
    cardsSelected: 'Karten ausgewählt',

    assessYourComptence: 'Beurteilen Sie Ihre Kompetenz',
    flipCard: 'Drehen Sie die Karte um, um die Definition zu sehen!',
    flipBack: 'Zurückblättern!',
    prev: 'Vorherige',
    next: 'Nächste',
    showBackface: 'Standardmäßig Rückseite anzeigen',
    leaveEarly: 'Möchten Sie die Übung wirklich vorzeitig verlassen?',

    goBack: 'Geh zurück',
    rememberedAndUnderstood: 'Konzepte erinnert und verstanden',
    rememberedNotUnderstood: 'Konzepte erinnert, aber nicht verstanden',
    understoodNotRemembered: 'Konzepte verstanden, aber nicht erinnert',
    notRememberedNotUnderstood: 'Konzepte weder erinnert noch verstanden',

    concept: 'Konzept',
    remember: 'Erinnern',
    understand: 'Verstehen',
  },
  quiz: {
    upcomingQuizzes: 'Kommende Quizze',
    quizDashboard: 'Quiz-Dashboard',
    demoQuiz: 'Demo-Quiz',
    previousQuizzes: 'Vorherige Quizze',
    ongoingQuizzes: 'Laufende Quizze',
    onTimeWarning:
      'Auf dieser Seite erhalten Sie einen Überblick über die kommenden Tests in den {courseId}-Vorlesungen. Beachten Sie, dass die Start- und Endzeiten streng sind. Seien Sie also pünktlich.',
    this: 'Dies',
    demoQuizText:
      'ist ein Demo-Quiz – damit Sie Ihre Hard-/Software testen (Sie benötigen einen aktuellen Chrome- oder Firefox-Browser) und das Format sehen können. Insbesondere sollten Sie in der Lage sein, die Mathematik im Problem des Handlungsreisenden zu lesen.',
  },
  vis: {
    goToTour: 'Gehen Sie zur Tour',
  },
  updates: {
    header: 'Systemaktualisierung',
  },
  myProfile: {
    myNotes: 'Meine Notizen',
    myCompetencyData: 'Meine Kompetenzdaten',
    learnerModelPriming: 'Grundierung des Lernmodells',

    downloadData: 'Laden Sie Ihre Daten herunter',
    downloadNotes: 'Laden Sie Ihre Notizen und Kommentare herunter',
    downloadProfile: 'Laden Sie Ihre Profildaten herunter',
    dataDeletion: 'Datenlöschung',
    purgeData: 'Löschen Sie Ihre Daten',

    choosePersona: 'Wählen Sie eine Person',
    resetFake: 'Fake-Benutzungsdaten zurücksetzen',

    confirmPurge: 'Bestätigen Sie die Datenlöschung',
    purgeWarning:
      'WARNUNG: Dadurch werden alle Daten gelöscht, die das System über Sie hat (Lernendenmodell, Interaktionsprotokolle, Kommentare und Notizen), mit Ausnahme der Informationen, dass/wann Sie die Daten gelöscht haben. Ihre Lernerfahrung kann erheblich beeinträchtigt werden.',
    dataPurged: 'Daten gelöscht',
    purgeError: 'Einige Fehler beim Löschen von Daten',
    purge: 'Säubern',
    cancel: 'Stornieren',
    confirmation: 'Bestätigung',
    confirmText: 'Meine Daten tilgen',
    purgeInstruction:
      'Geben Sie diesen Text zur Bestätigung in das Feld unten ein',
  },
  myLearnerModel: {
    learnerModel: 'Lernendenmodell',
    description1:
      'Anhand Ihrer Interaktionen mit dem System bemühen wir uns, Ihre Kompetenz in Bezug auf verschiedene Konzepte einzuschätzen. Wir verwenden das erweiterte Bloom-Modell ',
    description2:
      ', der Lernerkompetenzen für jedes Konzept in sechs kognitive Dimensionen einteilt. Als Folge sehen Sie sechs Wahrscheinlichkeitswerte, die die vorhergesagte Kompetenz dieses Konzepts darstellen. Dieses Kompetenzmodell (auch bekannt als Learner-Modell) wird in allen semantischen Diensten im VoLL-KI SSFC-System verwendet.',
  },
  courseView: {
    notes: 'Notizen',
    instructorNotes: 'Notizen des Lehrenden',
    showSlides: 'Folien anzeigen',
    showVideo: 'Videos zeigen',
    showSlidesAndVideo: 'Zeigen Sie Folien und Videos',
    courseContent: 'Kursinhalt',
    personalizedSuggestion: 'Personalisierter Vorschlag',
  },
  forum: {
    showReferredContent: 'Verwiesene Inhalte anzeigen',
    askAQuestion: 'Stellen Sie Frage',
    post: 'Post',
    postAnonymously: 'Anonym posten',
    enterQuestion: 'Schreiben Sie hier Ihre Frage...',
    showRemarks: 'Bemerkungen anzeigen',
    showOnlyUnanswered: 'Nur unbeantwortete anzeigen',
  },
  // Multi-Page Components
  header: {
    headerWarning:
      'WARNUNG: Research Prototype, er kann sich schlecht benehmen, abstürzen, Daten löschen, ... oder Sie sogar jederzeit ohne Vorwarnung glücklich machen!',
    login: 'Anmeldung',
    profile: 'Profil',
    logOut: 'Ausloggen',
    systemUpdate: 'Systemaktualisierung',
    helpCenter: 'Hilfezentrum',
    privacyPolicy: 'Datenschutz-Bestimmungen',
    legalNotice: 'Impressum',
    changeLanguage: 'Sprache ändern',
  },
  learnerModelPriming: {
    learnerModelPriming: 'Lernermodell-Vorbereitung',
    loginToContinue: 'Bitte einloggen zum Fortfahren',
    intro:
      'Ein Großteil der ALeA-Dienste hängt von der Qualität der Daten im ALeA-Lernendenmodell ' +
      'ab. Das Lernendenmodell repräsentiert das Wissen bzw. die Kompetenz der Lernenden in ' +
      'Bezug auf die Konzepte, die den Lernmaterialien zugrunde liegen. Die Daten im Modell ' +
      'basieren auf Aktivitäten der Lernenden im ALeA-System. Damit wir Ihnen möglichst von ' +
      'Anfang an die für Sie passenden Inhalte anbieten können, können Sie hier Ihre bisherigen ' +
      'Noten für die verschiedenen Module eintragen.',
    disclaimer:
      'Die Noten, die sie unten eingeben, werden anonym gespeichert und nur für das ' +
      'Lernendenmodell verwendet. Sie haben keinen Einfluss auf Ihre spätere Benotung in der ' +
      'Lehrveranstaltung und sind für die Lehrenden nicht einsehbar. Die Eingabe dient ' +
      'lediglich dazu, Ihnen ein besseres Lernerlebnis zu ermöglichen.',
    note: 'Anmerkung',
    note1:
      'Möglicherweise haben Sie andere als die unten aufgeführten Lehrveranstaltungen besucht. ' +
      'In diesem Fall geben Sie einfach nach bestem Wissen und Gewissen eine Note für die ' +
      'Lehrveranstaltung an.',
    note2:
      'Geben Sie Ihre Noten vorzugsweise in der deutschen Notenskala (1,0-5,0) an. Wenn Sie ' +
      'Ihre Noten nicht in diese Skala umrechnen können, können Sie Noten auch mit Hilfe der ' +
      'Prozentskala angeben.',
    note3:
      'Sie können Ihre Eingabe später nicht mehr ändern, ohne dass auch Ihr Lernendenmodell ' +
      'zurückgesetzt wird. Seien Sie daher vorsichtig bei der Eingabe der Noten.',
    course: 'Kurs',
    grade: 'Note',
    percentage: 'Prozentsatz',
    submit: 'Einreichen',
    submitConfirmation: 'Noteninformationen übermitteln?',
    submitSuccess: 'Bewertungsinformationen erfolgreich übermittelt!',
  },
  courseHome: {
    recordedSyllabus: 'Aufgezeichneter Lehrplan',
  },
};
