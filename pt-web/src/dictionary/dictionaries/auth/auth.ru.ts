export const authDict = {
  tabs: {login: "", register: ""},
  title: {login: "", register: ""},
  subtitle: {
    login: "",
    register: "",
  },
  fields: {
    fullName: "",
    email: "",
    password: "",
    passwordRepeat: "",
  },
  placeholders: {
    fullName: "",
    email: "",
    password: "",
    passwordRepeat: "",
  },
  errors: {
    nameRequired: "",
    passwordsMismatch: "",
    requestFailed: "",
  },
  buttons: {
    submitLogin: "",
    submitRegister: "",
    loading: "",
  },
} as const;

export type AuthDictRu = typeof authDict;
