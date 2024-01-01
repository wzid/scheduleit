import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

export function cn(...inputs: string[]) {
	// Merge class names
	return twMerge(clsx(inputs));
}
