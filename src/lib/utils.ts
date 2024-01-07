import type { CalendarValue } from '@melt-ui/svelte';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => {
  // Merge class names
  return twMerge(clsx(inputs));
};

export const stripDateData = (dates: CalendarValue<true> | undefined) => {
  const newDates: { day: number; month: number; year: number }[] = [];
  if (!dates) {
    return newDates;
  }
  for (const date of dates) {
    newDates.push({
      day: date.day,
      month: date.month,
      year: date.year
    });
  }
  return newDates;
};
