export interface StudentData {
  name: string;
  resumeURL: string;
  email: string;
  contactNo: string;
  programme: string;
  yearOfAdmission: string;
  yearOfGraduation: string;
  courses: string;
  grades: string;
  about: string;
}

export interface RecruiterData {
  name: string;
  email: string;
  position: string;
  mobile?: string;
  altMobile?: string;
  organizationId?: number;
  hasDefinedOrg?: number;
}

export interface OrganizationData {
  companyName: string;
  incorporationYear?: string;
  isStartup?: string;
  about?: string;
  website?: string;
  companyType?: string;
  officeAddress?: string;
  officePincode?: string;
}

export type RecruiterAndOrgData = RecruiterData & OrganizationData;



// export enum JobType {
//   Internship = 'internship',
//   FullTime = 'fulltime',
// }
export interface JobTypeInfo {
  id:number;
  jobTypeName:string;
  startDate:string;
  endDate?:string;
  internshipPeriod?:string;
}


export interface JobPostInfo {
  id:number;
  organizationId:number;
  jobTypeId: number;
  session:string;
  jobTitle:string;
  jobDescription:string;                                         
  trainingLocation: string;                              
  qualification:string;                                 
  targetYears:string;                                  
  openPositions:number;                                           
  currency:string;                                         
  stipend:number;                                       
  facilities:string;                                              
  applicationDeadline:Date;
}



