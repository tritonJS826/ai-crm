export const common = {
  buttons: {
    startTest: "Take the test",
    submitTest: "Submit",
  },
} as const;

export type CommonDictEn = typeof common;

export const notFoundDict = {
  title: "Page not found",
  goHome: "Go to Home",
} as const;

export type NotFoundDictEn = typeof notFoundDict;
