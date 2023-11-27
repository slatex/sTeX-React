export enum Presence {
    ONLINE = 'ONLINE',
    OFFLINE = 'OFFLINE',
    BOTH = 'BOTH'
}

export enum Languages {
    DE = 'DE',
    EN = 'EN'
}

export interface Studybuddy {
    userId: string,
    intro: string,
    studyProgram: string,
    email: string,
    semester: number,
    presence: Presence,
    languages: Languages,
    active: boolean,
    time: string,
    courseId: string
}

export interface StudyBuddyConnection {
    receiverId: string,
    courseId: string
}

export interface GetAllStudyBuddiesResponse {
    courseId: string,
    connected: Studybuddy[],
    requestSent: Studybuddy[],
    requestReceived: Studybuddy[],
    other: Studybuddy[]
}