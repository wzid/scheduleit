import { twMerge } from 'tailwind-merge'
import clsx from "clsx";

export function cn(...inputs: any[]) {
    // Merge class names
    return twMerge(clsx(inputs));
}