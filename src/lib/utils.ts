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
