import type { Timestamp } from "firebase/firestore";

export type ClassStatus = "Scheduled" | "Postponed" | "Cancelled";

export type TimetableEntry = {
  id: string;
  subject: string;
  faculty: string;
  dateTime: Timestamp;
  status: ClassStatus;
  createdAt: Timestamp;
};
