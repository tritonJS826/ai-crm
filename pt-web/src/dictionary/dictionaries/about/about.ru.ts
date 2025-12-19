export const aboutDict = {
  sectionAria: "О проекте",
  eyebrow: "О нас",
  title: "Поддержка психического здоровья — просто, бережно, рядом.",
  subtitle:
      "Мы объединяем диагностику, простые практики, статьи и профессиональную помощь." +
      "От первого шага к устойчивым результатам — в вашем темпе.",
  project: {
    blocks: [
      {title: "Миссия", text: "Сделать научно-обоснованную поддержку доступной и дружелюбной."},
      {title: "Подход", text: "Короткая диагностика, понятные шаги, личный план, SOS-памятки."},
      {title: "Формат", text: "Онлайн, гибкий график, напоминания и отслеживание прогресса."},
    ] as const,
  },
  specialistsTitle: "Наши специалисты",
  contactsTitle: "Контакты",
  contacts: {
    emailLabel: "Почта",
    phoneLabel: "Телефон",
    telegramLabel: "Телеграм",
    hoursLabel: "Время приёма",
    email: "care@brain100.io",
    phone: "+7 999 000-00-00",
    telegram: "@brain100_support",
    hours: "Пн–Пт, 10:00–18:00",
  },
  specialists: [
    {
      id: "sp-1",
      name: "Анна Петрова",
      role: "Клинический психолог",
      bio: "КПТ, управление стрессом, работа с тревогой и аффективными нарушениями. 8+ лет.",
      skills: ["КПТ", "Тревога", "Выгорание", "Гигиена сна"],
      links: {linkedin: "https://linkedin.com", website: "", telegram: ""},
      photoAlt: "Анна Петрова",
    },
  ] as const,
} as const;

export type AboutDictRu = typeof aboutDict;
