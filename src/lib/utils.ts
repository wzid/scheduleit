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

export const getTimeRangesFromDuration = (duration: { hours: number; minutes: number }) => {
  let totalMinutes = duration.minutes + duration.hours * 60;
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
};

function minutesToTime(minutes: number) {
  let hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  let period = 'AM';

  if (hours >= 12) {
    period = 'PM';
  }

  hours = hours % 12;
  if (hours === 0) {
    // the start of the time period in a 12-hour clock
    hours = 12;
  }

  return `${hours.toString()}:${mins.toString().padStart(2, '0')} ${period}`;
}

// converts given hex color to rgb object
function hexToRgb(hex: string) {
  if (hex.startsWith('#')) hex = hex.slice(1);
  if (hex.length === 3)
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('');
  if (hex.length !== 6) throw 'invalid hex length';
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16)
  };
}

// linearly interpolates between a and b by t
function lerp(a: number, b: number, t: number) {
  return a * (1 - t) + b * t;
}

// linearly interpolates between two hex colors
export function lerpColor(colorA: string, colorB: string, t: number) {
  const rgbA = hexToRgb(colorA);
  const rgbB = hexToRgb(colorB);
  const r = lerp(rgbA.r, rgbB.r, t);
  const g = lerp(rgbA.g, rgbB.g, t);
  const b = lerp(rgbA.b, rgbB.b, t);
  return `rgb(${r}, ${g}, ${b})`;
}

// percentage progress between a and b using t (b > a)
function progress(a: number, b: number, t: number) {
  const distance = b - a;
  return (t - a) / distance;
}

// returns a color gradient of size shades + 1
export function shadeGradient(shades: number) {
  // calculate shade levels
  const levels = Array(shades + 1)
    .fill(0)
    .map((v, i) => i / shades || 0);
  // convert shade levels to colors
  return levels.map((x) => {
    // this is the background color of the selector
    if (x === 0) return '#27272a'; // zinc-800
    if (x < 0.33) return lerpColor('#ffe8d5', '#ffa872', progress(0, 0.33, x));
    if (x < 0.69) return lerpColor('#ffa872', '#fd793a', progress(0.33, 0.69, x));
    if (x < 0.82) return lerpColor('#fd793a', '#ea4c20', progress(0.69, 0.82, x));
    return lerpColor('#ea4c20', '#c4290a', progress(0.82, 1, x));
  });
}
