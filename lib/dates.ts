const dateFormatter = new Intl.DateTimeFormat('en-PH', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-PH', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

/** Adds calendar months, clamping to the last day of shorter months (Jan 31 + 1mo = Feb 28). */
export function addMonths(date: Date, months: number) {
  const nextDate = new Date(date);
  const dayOfMonth = nextDate.getDate();
  nextDate.setDate(1);
  nextDate.setMonth(nextDate.getMonth() + months);
  const lastDayOfTargetMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate();
  nextDate.setDate(Math.min(dayOfMonth, lastDayOfTargetMonth));
  return nextDate;
}

/** Number of full calendar months completed between start and end. */
export function fullMonthsBetween(start: Date, end: Date) {
  if (end <= start) return 0;

  let months =
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());

  if (months > 0 && addMonths(start, months) > end) {
    months -= 1;
  }

  return Math.max(0, months);
}

export function formatShortDate(value: string | Date) {
  return dateFormatter.format(new Date(value));
}

export function formatDateTime(value: string | Date) {
  return dateTimeFormatter.format(new Date(value));
}
