export const profileDictEn = {
  page: {
    title: "Profile",
    subtitle: "Your data and subscription status.",
    logoutBtn: "Log out",
  },
  user: {
    title: "User data",
    name: "Name",
    preferredContactEmail: "Email",
    city: "City",
    phone: "Phone",
    language: "Language",
    preferredContactPhone: "Phone",
  },
  actions: {
    save: "Save",
    cancel: "Cancel",
  },
} as const;

export type ProfileDictEn = typeof profileDictEn;
