export interface StudentData {
  userId: string;
  name: string;
  gender: string;
  email: string;
  mobile: string;
  altMobile?: string;
  programme: string;
  courses: string;
  gpa: string;
  yearOfAdmission: string;
  yearOfGraduation: string;
  location: string;
  resumeURL?: string;
  socialLinks?: Record<string, string>;
  about?: string;
}

export interface RecruiterData {
  userId: string;
  name: string;
  email: string;
  position: string;
  mobile?: string;
  altMobile?: string;
  organizationId?: number;
  socialLinks?: Record<string, string>;
  about?: string;
}

export interface OrganizationData {
  id?: number;
  companyName: string;
  domain: string;
  incorporationYear?: string;
  isStartup?: string;
  about?: string;
  website?: string;
  companyType?: string;
  officeAddress?: string;
  officePincode?: string;
}

export type RecruiterAndOrgData = RecruiterData & OrganizationData;

// export enum jobCategories {
//   Internship = 'internship',
//   FullTime = 'fulltime',
// }
export interface JobCategoryInfo {
  id: number;
  jobCategory: string;
  startDate: string;
  endDate?: string;
  internshipPeriod?: string;
}

export interface JobPostInfo {
  id: number;
  organizationId: number;
  JobCategoryId: number;
  session: string;
  jobTitle: string;
  jobDescription: string;
  trainingLocation: string;
  qualification: string;
  targetYears: string;
  openPositions: number;
  currency: string;
  stipend: number;
  facilities: string;
  applicationDeadline: Date;
  createdByUserId?: string;
}

// export type InitialJobData = JobPostInfo | Pick<JobPostInfo, 'session'>;
export type InitialJobData = Partial<JobPostInfo>;
export interface JobApplicationInfo {
  id: number;
  jobPostId: number;
  applicantId: string;
  applicationStatus: string;
  applicantAction?: string;
  recruiterAction?: string;
  studentMessage?: string;
  recruiterMessage?: string;
  createdAt?: string;
}

// export interface ApplicantProfile extends JobApplicationInfo {
//   studentProfile: StudentData[];
// }
export type ApplicantWithProfile = JobApplicationInfo & {
  jobPostTitle?: string;
  studentProfile: StudentData;
};
