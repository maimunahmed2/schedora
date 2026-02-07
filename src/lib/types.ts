import type { Timestamp } from "firebase/firestore";

export type ClassStatus = "Scheduled" | "Postponed" | "Cancelled";

export type TimetableEntry = {
  id: string;
  subject: string;
  faculty: string;
  dayOfWeek: number; // 0=Sun, 6=Sat
  time: string;
  status: ClassStatus;
  createdAt: Timestamp;
};
