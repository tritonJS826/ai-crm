export const header = {
  nav: {
    about: "",
    profile: "",
    ariaPrimary: "",
    ariaHome: "",
    ariaOpenMenu: "",
    ariaMenu: "",
    ariaCloseMenu: "",
  },
  lang: {en: "EN", ru: "RU"},
} as const;

export type HeaderDictRu = typeof header;
