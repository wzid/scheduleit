import type { CalendarValue } from '@melt-ui/svelte';
import { clsx, type ClassValue } from 'clsx';
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

export const longpress = (node: HTMLElement, duration: number) => {
	let interval: any;

	const handleMousedown = () => {
		interval = setInterval(() => {
			node.dispatchEvent(new CustomEvent('longpress'));
		}, duration);
	};

	const handleMouseup = () => {
		clearInterval(interval);
	};

	node.addEventListener('mousedown', handleMousedown);
	node.addEventListener('mouseup', handleMouseup);

	return {
		update(newDuration: any) {
			duration = newDuration;
		},
		destroy() {
			clearInterval(interval);
			node.removeEventListener('mousedown', handleMousedown);
			node.removeEventListener('mouseup', handleMouseup);
		}
	};
}
