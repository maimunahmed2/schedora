import { type ClassStatus } from './types';

// Using a type here for clarity, even if not exported.
type ScheduleTemplateEntry = {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  subject: string;
  faculty: string;
  time: string;
  duration: number; // in hours
  status: ClassStatus;
  notes?: string;
};

export const scheduleTemplate: ScheduleTemplateEntry[] = [
  // Monday
  { dayOfWeek: 1, subject: "Engineering Mechanics (ME11001)", faculty: "Sushanta Kumar Sahoo", time: "09:00", duration: 1, status: "Scheduled" },
  { dayOfWeek: 1, subject: "Chemistry (CY11002)", faculty: "Dr. Papri Sutra", time: "10:00", duration: 1, status: "Scheduled" },
  { dayOfWeek: 1, subject: "Civil Core (CE11004)", faculty: "-", time: "11:00", duration: 1, status: "Scheduled" },
  { dayOfWeek: 1, subject: "Maths (MA11003)", faculty: "Dr. BH Raju", time: "13:00", duration: 1, status: "Scheduled" },
  { dayOfWeek: 1, subject: "Chemistry Lab", faculty: "-", time: "14:00", duration: 2, status: "Scheduled" },

  // Tuesday
  { dayOfWeek: 2, subject: "Maths (MA11003)", faculty: "Dr. BH Raju", time: "09:00", duration: 1, status: "Scheduled" },
  { dayOfWeek: 2, subject: "Electrical Lab", faculty: "-", time: "10:00", duration: 2, status: "Scheduled"},
  
  // Wednesday
  { dayOfWeek: 3, subject: "Engineering Mechanics (ME11001 T/A)", faculty: "Sushanta Kumar Sahoo", time: "09:00", duration: 1, status: "Scheduled" },
  { dayOfWeek: 3, subject: "Civil Core (CE11004)", faculty: "-", time: "10:00", duration: 1, status: "Scheduled" },
  { dayOfWeek: 3, subject: "Electrical (EE11001)", faculty: "-", time: "11:00", duration: 1, status: "Scheduled" },
  { dayOfWeek: 3, subject: "Chemistry (CY11002)", faculty: "Dr. Papri Sutra", time: "15:00", duration: 1, status: "Scheduled" },

  // Thursday
  { dayOfWeek: 4, subject: "Engineering Mechanics (ME11001)", faculty: "Sushanta Kumar Sahoo", time: "09:00", duration: 1, status: "Scheduled" },
  { dayOfWeek: 4, subject: "Maths (MA11003)", faculty: "Dr. BH Raju", time: "10:00", duration: 1, status: "Scheduled" },
  { dayOfWeek: 4, subject: "Electrical (EE11001)", faculty: "-", time: "11:00", duration: 1, status: "Scheduled" },
  { dayOfWeek: 4, subject: "Mechanical Workshop", faculty: "-", time: "14:00", duration: 3, status: "Scheduled" },

  // Friday
  { dayOfWeek: 5, subject: "Electrical (EE11001)", faculty: "-", time: "09:00", duration: 1, status: "Scheduled" },
  { dayOfWeek: 5, subject: "Chemistry (CY11002)", faculty: "Dr. Papri Sutra", time: "11:00", duration: 1, status: "Scheduled"},
  { dayOfWeek: 5, subject: "Civil Core (CE11004)", faculty: "-", time: "14:00", duration: 1, status: "Scheduled" },
  { dayOfWeek: 5, subject: "Engineering Mechanics (ME11001 T/A)", faculty: "Sushanta Kumar Sahoo", time: "14:00", duration: 1, status: "Scheduled" },
];
