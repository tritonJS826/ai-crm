import {DateTime} from "luxon";

const STEP = 1;

export const toAgoFormat = (date: string) => {
  const nowDate = DateTime.now();
  const inputDate = DateTime.fromISO(date);
  const diff = nowDate.diff(inputDate);
  let result;
  if (diff.as("years") > STEP) {
    result = nowDate.diff(inputDate, "years").toObject();
  } else if (diff.as("months") > STEP) {
    result = nowDate.diff(inputDate, "months").toObject();
  } else if (diff.as("weeks") > STEP) {
    result = nowDate.diff(inputDate, "weeks").toObject();
  } else if (diff.as("days") > STEP) {
    result = nowDate.diff(inputDate, "days").toObject();
  } else if (diff.as("hours") > STEP) {
    result = nowDate.diff(inputDate, "hours").toObject();
  } else if (diff.as("minutes") > STEP) {
    result = nowDate.diff(inputDate, "minutes").toObject();
  } else {
    return "less than a minute ago";
  }

  return `${Object.values(result)[0].toFixed(0)} ${Object.keys(result)[0]} ago`;
};

export const toAgoString = (date: string): string => {
  const nowDate = DateTime.now();
  const inputDate = DateTime.fromISO(date);
  const diff = nowDate.diff(inputDate);

  let result;
  if (diff.as("years") > STEP) {
    result = `${diff.as("years").toFixed(0)} y.`;
  } else if (diff.as("months") > STEP) {
    result = `${diff.as("months").toFixed(0)} m.`;
  } else if (diff.as("weeks") > STEP) {
    result = `${diff.as("weeks").toFixed(0)} w.`;
  } else if (diff.as("days") > STEP) {
    result = `${diff.as("days").toFixed(0)} d.`;
  } else if (diff.as("hours") > STEP) {
    result = `${diff.as("hours").toFixed(0)} h.`;
  } else if (diff.as("minutes") > STEP) {
    result = `${diff.as("minutes").toFixed(0)} min.`;
  } else {
    return "less than a minute ago";
  }

  return result;
};

export const toChatDateString = (date: string): string => {
  const nowDate = DateTime.now();
  const inputDate = DateTime.fromISO(date);
  const diff = nowDate.diff(inputDate);

  let result;
  if (diff.as("days") > STEP) {
    result = inputDate.toFormat("dd.LL.yyyy HH:mm");
  } else {
    result = inputDate.toFormat("HH:mm");
  }

  return result;
};
