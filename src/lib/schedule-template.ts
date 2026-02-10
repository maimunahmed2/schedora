import { type ClassStatus } from './types';

// Using a type here for clarity, even if not exported.
type ScheduleTemplateEntry = {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  subject: string;
  faculty: string;
  time: string;
  status: ClassStatus;
  notes?: string;
};

export const scheduleTemplate: ScheduleTemplateEntry[] = [
  // Sunday
  // { dayOfWeek: 0, subject: "Study Group Session", faculty: "Student Lead", time: "15:00", status: "Scheduled" },

  // Monday
  { dayOfWeek: 1, subject: "Engineering Mechanics (ME11001)", faculty: "Sushanta Kumar Sahoo", time: "09:00", status: "Scheduled" },
  { dayOfWeek: 1, subject: "Chemistry (CY11002)", faculty: "Dr. Papri Sutra", time: "10:00", status: "Scheduled" },
  { dayOfWeek: 1, subject: "Civil Core (CE11004)", faculty: "-", time: "11:00", status: "Scheduled" },
  { dayOfWeek: 1, subject: "Maths (MA11003)", faculty: "Dr. BH Raju", time: "13:00", status: "Scheduled" },
  { dayOfWeek: 1, subject: "Chemistry Lab", faculty: "-", time: "14:00", status: "Scheduled" },

  // Tuesday
  { dayOfWeek: 2, subject: "Maths (MA11003)", faculty: "Dr. BH Raju", time: "09:00", status: "Scheduled" },
  { dayOfWeek: 2, subject: "Electrical Lab", faculty: "-", time: "10:00", status: "Scheduled"},
  
  // Wednesday
  { dayOfWeek: 3, subject: "Engineering Mechanics (ME11001 T/A)", faculty: "Sushanta Kumar Sahoo", time: "09:00", status: "Scheduled" },
  { dayOfWeek: 3, subject: "Civil Core (CE11004)", faculty: "-", time: "10:00", status: "Scheduled" },
  { dayOfWeek: 3, subject: "Electrical (EE11001)", faculty: "-", time: "11:00", status: "Scheduled" },
  { dayOfWeek: 3, subject: "Chemistry (CY11002)", faculty: "Dr. Papri Sutra", time: "15:00", status: "Scheduled" },

  // Thursday
  { dayOfWeek: 4, subject: "Engineering Mechanics (ME11001)", faculty: "Sushanta Kumar Sahoo", time: "09:00", status: "Scheduled" },
  { dayOfWeek: 4, subject: "Maths (MA11003)", faculty: "Dr. BH Raju", time: "10:00", status: "Scheduled" },
  { dayOfWeek: 4, subject: "Electrical (EE11001)", faculty: "-", time: "11:00", status: "Scheduled" },
  { dayOfWeek: 4, subject: "Mechanical Workshop", faculty: "-", time: "14:00", status: "Scheduled" },

  // Friday
  { dayOfWeek: 5, subject: "Electrical (EE11001)", faculty: "-", time: "09:00", status: "Scheduled" },
  { dayOfWeek: 5, subject: "Chemistry (CY11002)", faculty: "Dr. Papri Sutra", time: "11:00", status: "Scheduled"},
  { dayOfWeek: 5, subject: "Civil Core (CE11004)", faculty: "-", time: "14:00", status: "Scheduled" },
  { dayOfWeek: 5, subject: "Engineering Mechanics (ME11001 T/A)", faculty: "Sushanta Kumar Sahoo", time: "14:00", status: "Scheduled" },

  // Saturday
  // { dayOfWeek: 6, subject: "Web Development Workshop", faculty: "Dr. Isla Chen", time: "10:00", status: "Scheduled" },
  // { dayOfWeek: 6, subject: "Competitive Programming", faculty: "Dr. Zander Quinn", time: "13:00", status: "Scheduled" },
];
