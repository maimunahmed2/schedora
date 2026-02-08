import { type ClassStatus } from './types';

// Using a type here for clarity, even if not exported.
type ScheduleTemplateEntry = {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  subject: string;
  faculty: string;
  time: string;
  status: ClassStatus;
};

export const scheduleTemplate: ScheduleTemplateEntry[] = [
  // Sunday
  { dayOfWeek: 0, subject: "Study Group Session", faculty: "Student Lead", time: "15:00", status: "Scheduled" },

  // Monday
  { dayOfWeek: 1, subject: "Data Structures", faculty: "Prof. Elara Vance", time: "09:00", status: "Scheduled" },
  { dayOfWeek: 1, subject: "Algorithms", faculty: "Dr. Ronan Finch", time: "11:00", status: "Scheduled" },
  { dayOfWeek: 1, subject: "Database Systems", faculty: "Prof. Lena Petrova", time: "14:00", status: "Scheduled" },
  
  // Tuesday
  { dayOfWeek: 2, subject: "Operating Systems", faculty: "Dr. Kenji Tanaka", time: "10:00", status: "Scheduled" },
  { dayOfWeek: 2, subject: "Computer Networks", faculty: "Prof. Anya Sharma", time: "13:00", status: "Scheduled" },
  
  // Wednesday
  { dayOfWeek: 3, subject: "Mechanics (ME11001 T/A)", faculty: "Fac1", time: "09:00", status: "Scheduled" },
  { dayOfWeek: 3, subject: "Civil Core (CE11004)", faculty: "Fac2", time: "10:00", status: "Scheduled" },
  { dayOfWeek: 3, subject: "Electrical (EE11001)", faculty: "Fac3", time: "11:00", status: "Scheduled" },
  { dayOfWeek: 3, subject: "Chemistry (CY11002)", faculty: "Fac4", time: "15:00", status: "Scheduled" },

  // Thursday
  { dayOfWeek: 4, subject: "Algorithms", faculty: "Dr. Ronan Finch", time: "10:00", status: "Scheduled" },
  { dayOfWeek: 4, subject: "Operating Systems", faculty: "Dr. Kenji Tanaka", time: "13:00", status: "Scheduled" },

  // Friday
  { dayOfWeek: 5, subject: "Database Systems", faculty: "Prof. Lena Petrova", time: "09:00", status: "Scheduled" },
  { dayOfWeek: 5, subject: "Software Engineering", faculty: "Dr. Marcus Thorne", time: "11:00", status: "Scheduled" },
  { dayOfWeek: 5, subject: "Computer Networks", faculty: "Prof. Anya Sharma", time: "14:00", status: "Scheduled" },

  // Saturday
  { dayOfWeek: 6, subject: "Web Development Workshop", faculty: "Dr. Isla Chen", time: "10:00", status: "Scheduled" },
  { dayOfWeek: 6, subject: "Competitive Programming", faculty: "Dr. Zander Quinn", time: "13:00", status: "Scheduled" },
];
