export const profileDictRu = {
  page: {
    title: "",
    subtitle: "",
    logoutBtn: "",
  },
  user: {
    title: "",
    name: "",
    preferredContactEmail: "",
  },
  actions: {
    save: "",
    cancel: "",
  },
} as const;

export type ProfileDictRu = typeof profileDictRu;
