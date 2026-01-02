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
    city: "",
    phone: "",
    language: "",
    preferredContactPhone: "",
  },
  actions: {
    save: "",
    cancel: "",
  },
} as const;

export type ProfileDictRu = typeof profileDictRu;
