export const testsDict = {
  title: "Tests catalog",
  subtitle: "A selection of validated questionnaires for self-screening. Results are not a diagnosis.",
  searchPlaceholder: "Search a test…",
  ariaSearchLabel: "Search by test name",
  foundPrefix: "Found:",
  cta: "Take the test",
  empty: "Nothing found. Try a different query.",
  tests: [
    {id: "1", name: "Depression screening test"},
    {id: "2", name: "Mood test"},
    {id: "3", name: "Anxiety level test"},
    {id: "4", name: "Stress profile"},
  ] as const,
} as const;

export type TestsDictEn = typeof testsDict;
