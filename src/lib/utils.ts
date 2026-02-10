import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getEndTime(startTime: string, duration: number): string {
  if (!startTime || !/^\d{2}:\d{2}$/.test(startTime)) return '';
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const totalStartMinutes = startHours * 60 + startMinutes;
  const durationMinutes = duration * 60;
  const totalEndMinutes = totalStartMinutes + durationMinutes;

  const endHours = Math.floor(totalEndMinutes / 60) % 24;
  const endMinutes = totalEndMinutes % 60;

  const format = (num: number) => num.toString().padStart(2, '0');
  return `${format(endHours)}:${format(endMinutes)}`;
}
