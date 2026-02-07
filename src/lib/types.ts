import type { Timestamp } from "firebase/firestore";

export type ClassStatus = "Scheduled" | "Postponed" | "Cancelled";

export type TimetableEntry = {
  id: string;
  subject: string;
  faculty: string;
  date: string; // Stored as YYYY-MM-DD
  time: string; // Stored as HH:mm
  status: ClassStatus;
  createdAt: Timestamp;
};
