export enum Language {
    Deutsch = 'Deutsch',
    English = 'English',
    Arabic = 'Arabic',
    Bengali = 'Bengali',
    Hindi = 'Hindi',
    French = 'French',
    Japanese = 'Japanese',
    Korean = 'Korean',
    Mandarin = 'Mandarin',
    Marathi = 'Marathi',
    Persian = 'Persian',
    Portuguese = 'Portuguese',
    Russian = 'Russian',
    Spanish = 'Spanish',
    Tamil = 'Tamil',
    Telugu = 'Telugu',
    Turkish = 'Turkish',
    Urdu = 'Urdu',
    Vietnamese = 'Vietnamese',
    Others = 'Others',
  }

export interface myprofile{
    userId?: string;
    firstName: string;
    lastName: string;
    email: string;
    studyProgram: string;
    semester: string;
    languages: Language;
}