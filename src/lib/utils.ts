import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { differenceInDays, format } from "date-fns";
import { de } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function relativesDatum(dateStr: string): string {
  const date = new Date(dateStr);
  const heute = new Date();
  const diffTage = differenceInDays(heute, date);
  if (diffTage === 0) return 'heute';
  if (diffTage === 1) return 'gestern';
  if (diffTage < 7) return `vor ${diffTage} Tagen`;
  if (diffTage < 14) return 'vor einer Woche';
  return format(date, 'd. MMM', { locale: de });
}
