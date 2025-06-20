export interface SemesterPeriod {
  name: string;
  semesterStart: string;
  semesterEnd: string;
  lectureStart: string;
  lectureEnd: string;
}

export interface Holiday {
  date: string;
  name: string;
  lectureFree?: boolean;
}

export const semesterPeriods: SemesterPeriod[] = [
  {
    name: 'SS25',
    semesterStart: '2025-04-01',
    semesterEnd: '2025-09-30',
    lectureStart: '2025-04-23',
    lectureEnd: '2025-07-25',
  },
  {
    name: 'WS25-26',
    semesterStart: '2025-10-01',
    semesterEnd: '2026-03-31',
    lectureStart: '2025-10-13',
    lectureEnd: '2026-02-06',
  },
];

export const holidays: Holiday[] = [
  { date: '2025-04-18', name: 'Good Friday', lectureFree: true },
  { date: '2025-04-21', name: 'Easter Monday', lectureFree: true },
  { date: '2025-05-01', name: 'Labour Day', lectureFree: true },
  { date: '2025-05-29', name: 'Ascension Day', lectureFree: true },
  { date: '2025-06-09', name: 'Whit Monday', lectureFree: true },
  { date: '2025-06-10', name: 'No lecture', lectureFree: true },
  { date: '2025-06-19', name: 'Feast of Corpus Christi', lectureFree: true },
  { date: '2025-06-20', name: 'No Lecture', lectureFree: true },
  { date: '2025-10-03', name: 'Day of German Unity', lectureFree: true },
  { date: '2025-11-01', name: 'All Saints Day', lectureFree: true },
];
