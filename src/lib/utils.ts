import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export let cn = (...inputs: ClassValue[]) => {
  // Merge class names
  return twMerge(clsx(inputs));
}

export let stripDatesData = (dates: any[]): any[] => {
  let newDates = [];
  for (let date of dates) {
    newDates.push({
      day: date.day,
      month: date.month,
      year: date.year,
    })
  }
  return newDates;
};