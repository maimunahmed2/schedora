import type { Timestamp } from "firebase/firestore";

export type ClassStatus = "Scheduled" | "Postponed" | "Cancelled";

export type TimetableEntry = {
  id: string;
  subject: string;
  faculty: string;
  date: Timestamp;
  time: string;
  status: ClassStatus;
  createdAt: Timestamp;
};
