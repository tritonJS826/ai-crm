import type {Test} from "src/services/tests.api";

export const testsMockRu: Record<string, Test> = {
  "1": {
    id: "1",
    name: "Тест на наличие депрессии",
    questions: [
      {id: 1, type: "text", question: "Как вы спали прошлой ночью?", placeholder: "Например: хорошо / 7 часов"},
      {
        id: 2,
        type: "checkbox",
        question: "Что помогало сегодня? (можно несколько)",
        options: ["Сон", "Прогулка", "Разговор с близким", "Упражнения"],
      },
      {id: 3, type: "radio", question: "Настроение сейчас", options: ["Спокойное", "Напряжённое", "Радостное"]},
    ],
  },
};
