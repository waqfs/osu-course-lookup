export type SearchQueryResult = {
  data: {
    totalItems: number;
    currentItemCount: number;
    page: number;
    totalPages: number;
    refineQueryTemplate: string;
    nextPageLink: string | null;
    prevPageLink: string | null;
    activeSort: string;
    sort: SearchQuerySort[];
    filters: SearchQueryFilters[];
    activeFilters: SearchQueryActiveFilter[];
    courses: CourseResult[];
  };
};

export type SearchQuerySort = {
  key: string;
  title: string;
  type: string;
  direction: string;
  link: string;
};

export type SearchQueryActiveFilter = {
  name: string;
  slug: string;
  value: string;
  rawValue: string;
  removeLink: string;
};

export type SearchQueryFilters = {
  title: string;
  slug: string;
  items: FilterItem[];
};

export type FilterItem = {
  title: string;
  term: string;
  count: number;
  selected: boolean;
  link: string;
  removeLink: string;
};

export type CourseResult = {
  course: CourseDetails;
  sections: SectionDetail[];
};

export type CourseDetails = {
  term: string;
  effectiveDate: string;
  effectiveStatus: string;
  title: string;
  shortDescription: string;
  description: string;
  equivalentId: string;
  allowMultiEnroll: string;
  maxUnits: number;
  minUnits: number;
  repeatedUnitsLimit: number;
  grading: string;
  component: string;
  primaryComponent: string;
  offeringNumber: string;
  academicGroup: string;
  subject: string;
  catalogNumber: string;
  campus: string;
  academicOrg: string;
  academicCareer: string;
  cipCode: string;
  courseAttributes: Attribute[];
  campusCode: string;
  catalogLevel: string;
  subjectDesc: string;
  courseId: string;
};

export type SectionDetail = {
  classNumber: string;
  section: string;
  component: string;
  instructionMode: string;
  meetings: MeetingDetail[];
  courseOfferingNumber: number;
  courseId: string;
  academicGroup: string;
  subject: string;
  catalogNumber: string;
  career: string;
  description: string;
  enrollmentStatus: string;
  status: string;
  type: string;
  associatedClass: string;
  autoEnrollWaitlist: boolean;
  autoEnrollSection1: unknown | null;
  autoEnrollSection2: unknown | null;
  consent: boolean;
  waitlistCapacity: number;
  minimumEnrollment: number;
  waitlistTotal: number;
  academicOrg: string;
  location: string;
  equivalentCourseId: unknown | null;
  startDate: string;
  endDate: string;
  cancelDate: unknown | null;
  primaryInstructorSection: string;
  combinedSection: string;
  holidaySchedule: string;
  sessionCode: string;
  sessionDescription: string;
  term: string;
  campus: string;
  attributes: unknown[];
  secCampus: string;
  secAcademicGroup: string;
  secCatalogNumber: string;
  meetingDays: string;
  _parent: string;
  subjectDesc: string;
  courseTitle: string;
  courseDescription: string;
  catalogLevel: string;
  termCode: string;
};

export type MeetingDetail = HistoricMeetingDetail & {
  meetingNumber: number;
  facilityId: string;
  facilityType: string;
  facilityDescription: string;
  facilityDescriptionShort: string;
  facilityGroup: boolean;
  facilityCapacity: number;
  buildingCode: string;
  room: string;
  buildingDescription: string;
  buildingDescriptionShort: string;
  standingMeetingPattern: unknown | null;
};

export type HistoricMeetingDetail = {
  facilityId: string;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  instructors: Instructor[];
};

export type Attribute = {
  name: string;
  value: string;
  description: string;
};

export type Instructor = {
  displayName: string | null;
  role: string | null;
  email: string | null;
};
