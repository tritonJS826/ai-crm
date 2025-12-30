export const header = {
  nav: {
    about: "About",
    profile: "Profile",
    ariaPrimary: "Primary navigation",
    ariaHome: "Home",
    ariaOpenMenu: "Open menu",
    ariaMenu: "Navigation menu",
    ariaCloseMenu: "Close menu",
  },
  lang: {en: "EN", ru: "RU"},
} as const;

export type HeaderDictEn = typeof header;
