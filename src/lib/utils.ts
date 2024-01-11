import type { CalendarValue } from '@melt-ui/svelte';
import { clsx, type ClassValue } from 'clsx';
import type { ActionReturn } from 'svelte/action';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => {
  // Merge class names
  return twMerge(clsx(inputs));
};

export const convertDatesToISO = (dates: CalendarValue<true> | undefined) => {
  const newDates: string[] = [];
  if (!dates) {
    return newDates;
  }
  for (const date of dates) {
    newDates.push(
      date.year +
      '-' +
      date.month.toString().padStart(2, '0') +
      '-' +
      date.day.toString().padStart(2, '0')
    );
  }
  return newDates;
};

export function longpress(
  node: HTMLElement,
  duration: number
): ActionReturn<number, { 'on:longpress': (e: CustomEvent<number>) => void }> {
  let intervalId: NodeJS.Timeout;

  const handleMousedown = () => {
    intervalId = setInterval(() => {
      node.dispatchEvent(new CustomEvent('longpress'));
    }, duration);
  };

  const handleMouseup = () => {
    clearInterval(intervalId);
  };

  node.addEventListener('mousedown', handleMousedown);
  node.addEventListener('mouseup', handleMouseup);

  return {
    update: (newDuration: number) => {
      duration = newDuration;
    },
    destroy: () => {
      clearInterval(intervalId);
      node.removeEventListener('mousedown', handleMousedown);
      node.removeEventListener('mouseup', handleMouseup);
    }
  };
}


export const getTimeRangesFromDuration = (duration: { hours: number, minutes: number }) => {
  let totalMinutes = duration.minutes +  duration.hours * 60;
  if (totalMinutes == 0) {
    return [];
  }

  const ranges = [];
  // we want to get all the ranges of time that are possible with the given duration of a meeting
  for (let i = 0; i <= 1440; i += totalMinutes) {
    if (i + totalMinutes <= 1440) {
      ranges.push({
        start: minutesToTime(i),
        end: minutesToTime(i + totalMinutes)
      });
    }
  }
  return ranges;
}



function minutesToTime(minutes: number) {
  let hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  let period = 'AM';

  if (hours >= 12) {
    period = 'PM';
  }

  hours = hours % 12;
  if (hours === 0) { // the start of the time period in a 12-hour clock
    hours = 12;
  }

  return `${hours.toString()}:${mins.toString().padStart(2, '0')} ${period}`;
}