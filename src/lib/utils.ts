import type { CalendarValue } from '@melt-ui/svelte';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => {
  // Merge class names
  return twMerge(clsx(inputs));
};

export const stripDatesData = (dates: CalendarValue<true>) => {
  let newDates = [];
  for (const date of dates) {
    newDates.push({
      day: date.day,
      month: date.month,
      year: date.year
    });
  }
  return newDates;
};
