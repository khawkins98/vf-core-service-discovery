import { addDays, addHours, addMinutes, addMonths, addSeconds, addYears } from 'date-fns';
import path from 'path';
import os from 'os';
import { ParsedRelativeTime, PipelineItem } from './types';

export function getAppDirectory(...segments: string[]): string {
  return path.join(os.homedir(), '.vf-core-service-discovery', ...segments);
}

export function getAppConfigFileName(): string {
  return path.join(getAppDirectory(), 'config.json');
}

export function getVfCoreRepository(...segments: string[]): string {
  return path.join(getAppDirectory(), 'vf-core', ...segments);
}

export function parseRelativeTime(relativeTime: string, fromDate: Date): Date {
  const parsedRelativeTime: ParsedRelativeTime = {};

  for (const item of relativeTime.split(' ')) {
    const modifier = item[item.length - 1];
    const quantity = parseInt(item.slice(0, -1), 10);

    switch (modifier) {
      case 'Y':
        parsedRelativeTime.years = quantity;
        break;
      case 'M':
        parsedRelativeTime.months = quantity;
        break;
      case 'D':
        parsedRelativeTime.days = quantity;
        break;
      case 'h':
        parsedRelativeTime.hours = quantity;
        break;
      case 'm':
        parsedRelativeTime.minutes = quantity;
        break;
      case 's':
        parsedRelativeTime.seconds = quantity;
        break;
    }
  }

  let date = new Date(fromDate);

  if (parsedRelativeTime.years) {
    date = addYears(date, parsedRelativeTime.years);
  }

  if (parsedRelativeTime.months) {
    date = addMonths(date, parsedRelativeTime.months);
  }

  if (parsedRelativeTime.days) {
    date = addDays(date, parsedRelativeTime.days);
  }

  if (parsedRelativeTime.hours) {
    date = addHours(date, parsedRelativeTime.hours);
  }

  if (parsedRelativeTime.minutes) {
    date = addMinutes(date, parsedRelativeTime.minutes);
  }

  if (parsedRelativeTime.seconds) {
    date = addSeconds(date, parsedRelativeTime.seconds);
  }

  return date;
}

export function asyncFlow(...fns: PipelineItem[]): Promise<any> {
  return fns.reduce(async (previousPromise, fn) => fn(await previousPromise), Promise.resolve());
}
