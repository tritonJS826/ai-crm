export const header = {
  lang: {ru: "RU", en: "EN"},
  nav: {
    about: "About",
    mental: "Conditions",
    tests: "Tests",
    biohacking: "Biohacking",
    profile: "Profile",
    sos: "SOS",
    ariaPrimary: "Primary navigation",
    ariaMenu: "Menu",
    ariaHome: "Home",
    ariaOpenMenu: "Open menu",
    ariaCloseMenu: "Close menu",
    menus: {
      mental: {
        "panic-attack": "Panic attack",
        anxiety: "Anxiety",
        depression: "Depression",
        burnout: "Burnout",
      },
      tests: {
        "1": "Depression screening",
        "2": "Mood test",
      },
      biohacking: {
        "sleep-hygiene": "Sleep hygiene",
        "nutrition-focus": "Nutrition & energy",
        breathing: "Breathing practices",
      },
    },
  },
  dock: {
    allStates: "All conditions",
    allTests: "All tests",
    allArticles: "All articles",
    takeTest: "Take a test",
  },
  promo: {
    consultCta: "Submit a consultation request",
    registerCta: "Sign up and track your results",
    subscribeCta: "Subscribe for article updates",
  },
} as const;

export type HeaderDictEn = typeof header;
