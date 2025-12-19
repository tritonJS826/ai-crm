export const aboutDict = {
  sectionAria: "About the project",
  eyebrow: "About",
  title: "Support for mental health — simple, gentle, close.",
  subtitle:
      "We combine diagnostics, simple practices, articles, and professional help." +
      "From first step to lasting results — at your pace.",
  project: {
    blocks: [
      {title: "Mission", text: "Make evidence-based mental health support accessible and friendly."},
      {title: "Approach", text: "Short diagnostics, clear steps, personal plan, SOS guidance."},
      {title: "Format", text: "Online first, flexible schedule, reminders, progress tracking."},
    ] as const,
  },
  specialistsTitle: "Our specialists",
  contactsTitle: "Contacts",
  contacts: {
    emailLabel: "Email",
    phoneLabel: "Phone",
    telegramLabel: "Telegram",
    hoursLabel: "Hours",
    email: "care@brain100.io",
    phone: "+1 555 0100",
    telegram: "@brain100_support",
    hours: "Mon–Fri, 10:00–18:00",
  },
  specialists: [
    {
      id: "sp-1",
      name: "Anna Petrova",
      role: "Clinical Psychologist",
      bio: "CBT, stress management, work with anxiety and mood disorders. 8+ years.",
      skills: ["CBT", "Anxiety", "Burnout", "Sleep hygiene"],
      links: {linkedin: "https://linkedin.com", website: "", telegram: ""},
      photoAlt: "Anna Petrova",
    },
  ] as const,
} as const;

export type AboutDictEn = typeof aboutDict;
