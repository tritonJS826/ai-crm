export const common = {
  buttons: {
    startTest: "Пройти тест",
    submitTest: "Отправить",
  },
} as const;

export type CommonDictRu = typeof common;

export const notFoundDict = {
  title: "Страница не найдена",
  goHome: "На главную",
} as const;

export type NotFoundDictRu = typeof notFoundDict;
