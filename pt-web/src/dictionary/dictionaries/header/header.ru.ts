export const header = {
  lang: {ru: "RU", en: "EN"},
  nav: {
    about: "О нас",
    mental: "Состояния",
    tests: "Тесты",
    biohacking: "Биохакинг",
    profile: "Личный кабинет",
    sos: "SOS",
    ariaPrimary: "Основная навигация",
    ariaMenu: "Меню",
    ariaHome: "Домой",
    ariaOpenMenu: "Открыть меню",
    ariaCloseMenu: "Закрыть меню",
    menus: {
      mental: {
        "panic-attack": "Паническая атака",
        anxiety: "Тревога",
        depression: "Депрессия",
        burnout: "Выгорание",
      },
      tests: {
        "1": "Тест на наличие депрессии",
        "2": "Тест о настроении",
      },
      biohacking: {
        "sleep-hygiene": "Гигиена сна",
        "nutrition-focus": "Питание и энергия",
        breathing: "Дыхательные практики",
      },
    },
  },
  dock: {
    allStates: "Все состояния",
    allTests: "Все тесты",
    allArticles: "Все статьи",
    takeTest: "Пройти тест",
  },
  promo: {
    consultCta: "Оставь заявку на консультацию",
    registerCta: "Регистрируйся и следи за результатами",
    subscribeCta: "Подпишись и получай новости о статьях",
  },
} as const;

export type HeaderDictRu = typeof header;
