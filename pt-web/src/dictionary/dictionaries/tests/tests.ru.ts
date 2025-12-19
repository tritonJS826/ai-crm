export const testsDict = {
  title: "Каталог тестов",
  subtitle: "Подборка валидированных опросников для самопроверки. Результаты не являются диагнозом.",
  searchPlaceholder: "Поиск теста…",
  ariaSearchLabel: "Поиск по названию теста",
  foundPrefix: "Найдено:",
  cta: "Пройти тест",
  empty: "Ничего не найдено. Попробуйте другой запрос.",
  tests: [
    {id: "1", name: "Тест на наличие депрессии"},
    {id: "2", name: "Тест о настроении"},
    {id: "3", name: "Тест на уровень тревожности"},
    {id: "4", name: "Стресс-профиль"},
  ] as const,
} as const;

export type TestsDictRu = typeof testsDict;
