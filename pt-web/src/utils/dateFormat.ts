const STEP = 1;
const MILLISECONDS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const DAYS_PER_WEEK = 7;
const DAYS_PER_MONTH = 31;
const DAYS_PER_YEAR = 366;

/**
 * Converts an ISO date string into a human-readable "time ago" string.
 *
 * The function calculates the difference between the current time and
 * the provided date, then returns the largest appropriate time unit:
 * minutes, hours, days, weeks, months, or years.
 *
 * Returned formats:
 * - `"X y."`   — years
 * - `"X m."`   — months
 * - `"X w."`   — weeks
 * - `"X d."`   — days
 * - `"X h."`   — hours
 * - `"X min."` — minutes
 * - `"less than a minute ago"` — if under the minimum threshold
 *
 * Notes:
 * - The input date is adjusted using the local timezone offset.
 * - The constants `STEP`, `MS_PER_SECOND`, `SECONDS_PER_MINUTE`,
 *   `MINUTES_PER_HOUR`, `HOURS_PER_DAY`, `DAYS_PER_WEEK`,
 *   `DAYS_PER_MONTH`, and `DAYS_PER_YEAR` must be defined elsewhere.
 *
 * @param dateISO - An ISO 8601 formatted date string (e.g. `"2024-01-15T10:30:00Z"`)
 * @returns A short relative time string representing how long ago the date occurred
 *
 * @example
 * ```ts
 * toAgoString("2024-01-01T00:00:00Z"); // "2 w."
 * toAgoString(new Date().toISOString()); // "less than a minute ago"
 * ```
 */

export function toAgoString (dateISO: string): string {
  const nowDateMs = Date.now();
  const inputDateMs = new Date(dateISO).valueOf()
  + (new Date(dateISO).getTimezoneOffset() * MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE);

  const diffInMinutes = (nowDateMs - inputDateMs)
  / MILLISECONDS_PER_SECOND
  / SECONDS_PER_MINUTE;
  const diffInHours = diffInMinutes / MINUTES_PER_HOUR;
  const diffInDays = diffInHours / HOURS_PER_DAY;
  const diffInWeeks = diffInDays / DAYS_PER_WEEK;
  const diffInMonth = diffInDays / DAYS_PER_MONTH;
  const diffInYears = diffInDays / DAYS_PER_YEAR;

  if (diffInYears > STEP) {
    return `${diffInYears.toFixed(0)} y.`;
  }

  if (diffInMonth > STEP) {
    return `${diffInMonth.toFixed(0)} m.`;
  }

  if (diffInWeeks > STEP) {
    return `${diffInWeeks.toFixed(0)} w.`;
  }

  if (diffInDays > STEP) {
    return `${diffInDays.toFixed(0)} d.`;
  }

  if (diffInHours > STEP) {
    return `${diffInHours.toFixed(0)} h.`;
  }

  if (diffInMinutes > STEP) {
    return `${diffInMinutes.toFixed(0)} min.`;
  }

  return "less than a minute ago";

};

const OFFSET = 1;
const DATE_PART_MIN_LENGTH = 1;

/**
 * Converts an ISO date string into a chat-friendly time or date-time string.
 *
 * The function compares the provided date with the current time:
 * - If the difference is less than or equal to `STEP` days, it returns only the UTC time (`HH:mm`).
 * - If the difference is greater than `STEP` days, it returns the full UTC date and time (`DD.MM.YYYY HH:mm`).
 *
 * All formatting is done in UTC.
 *
 * @param dateISO - A valid ISO 8601 date string (e.g. `"2026-01-15T10:30:00.000Z"`).
 *
 * @returns A formatted string for chat display:
 * - `"HH:mm"` if the date is recent
 * - `"DD.MM.YYYY HH:mm"` if the date is older than `STEP` days
 *
 * @example
 * toChatDateString("2026-01-16T08:45:00Z");
 * // → "08:45"
 *
 * @example
 * toChatDateString("2025-12-01T14:20:00Z");
 * // → "01.12.2025 14:20"
 */
export function toChatDateString (dateISO: string): string {
  const nowDateMs = Date.now();
  const inputDate = new Date(dateISO);
  const inputDateMs = inputDate.valueOf()
  + (inputDate.getTimezoneOffset() * MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE);

  const diffInDays = (nowDateMs - inputDateMs)
  / MILLISECONDS_PER_SECOND
  / SECONDS_PER_MINUTE
  / MINUTES_PER_HOUR
  / HOURS_PER_DAY;

  const utcMonth = inputDate.getUTCMonth().toString().length === DATE_PART_MIN_LENGTH
    ? `0${inputDate.getUTCMonth() + OFFSET}`
    : `${inputDate.getUTCMonth() + OFFSET}`;

  const utcHours = inputDate.getUTCHours().toString().length === DATE_PART_MIN_LENGTH
    ? `0${inputDate.getUTCHours() + OFFSET}`
    : `${inputDate.getUTCHours() + OFFSET}`;

  const utcMinutes = inputDate.getUTCMinutes().toString().length === DATE_PART_MIN_LENGTH
    ? `0${inputDate.getUTCMinutes() + OFFSET}`
    : `${inputDate.getUTCMinutes() + OFFSET}`;

  const utcTime = `${utcHours}:${utcMinutes}`;
  const utcDate = `${inputDate.getUTCDate()}.${utcMonth}.${inputDate.getUTCFullYear()}`;

  if (diffInDays > STEP) {
    return `${utcDate} ${utcTime}`;
  }

  return utcTime;
};
