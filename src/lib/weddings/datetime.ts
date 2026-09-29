import { DEFAULT_TIMEZONE } from "./constants";

export function isValidTimeZone(timeZone: string) {
  try {
    Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch {
    return false;
  }
}

function partsInZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);

  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");

  let hour = pick("hour");
  const day = pick("day");
  if (hour === 24) {
    hour = 0;
  }

  return {
    year: pick("year"),
    month: pick("month"),
    day,
    hour,
    minute: pick("minute"),
    second: pick("second"),
  };
}

export function zonedDateTimeToUtc(dateTimeLocal: string, timeZone: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/.exec(dateTimeLocal);
  if (!match || !isValidTimeZone(timeZone)) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4] ?? "0");
  const minute = Number(match[5] ?? "0");
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const zoned = partsInZone(utcGuess, timeZone);
  const zonedAsUtc = Date.UTC(
    zoned.year,
    zoned.month - 1,
    zoned.day,
    zoned.hour,
    zoned.minute,
    zoned.second,
  );
  const offset = zonedAsUtc - utcGuess.getTime();
  return new Date(utcGuess.getTime() - offset);
}

export function formatDateInput(date: Date, timeZone = DEFAULT_TIMEZONE) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${pick("year")}-${pick("month")}-${pick("day")}`;
}

export function formatDateTimeLocal(date: Date, timeZone = DEFAULT_TIMEZONE) {
  const zoned = partsInZone(date, timeZone);
  const hour = String(zoned.hour).padStart(2, "0");
  const minute = String(zoned.minute).padStart(2, "0");
  const month = String(zoned.month).padStart(2, "0");
  const day = String(zoned.day).padStart(2, "0");
  return `${zoned.year}-${month}-${day}T${hour}:${minute}`;
}

export function formatLongDate(date: Date, timeZone = DEFAULT_TIMEZONE) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatEventWhen(date: Date, timeZone = DEFAULT_TIMEZONE) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function daysUntil(date: Date, timeZone = DEFAULT_TIMEZONE) {
  const today = Date.parse(`${formatDateInput(new Date(), timeZone)}T00:00:00Z`);
  const target = Date.parse(`${formatDateInput(date, timeZone)}T00:00:00Z`);
  return Math.round((target - today) / 86_400_000);
}
