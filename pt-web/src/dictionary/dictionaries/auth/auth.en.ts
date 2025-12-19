export const authDict = {
  tabs: {login: "Log in", register: "Sign up"},
  title: {login: "Log in", register: "Sign up"},
  subtitle: {
    login: "Enter your account details",
    register: "Create a new account",
  },
  fields: {
    fullName: "Full name",
    email: "Email",
    password: "Password",
    passwordRepeat: "Repeat password",
  },
  placeholders: {
    fullName: "Your name",
    email: "name@example.com",
    password: "At least 6 characters",
    passwordRepeat: "Repeat the password",
  },
  errors: {
    nameRequired: "Please enter your name",
    passwordsMismatch: "Passwords do not match",
    requestFailed: "Request failed. Try again.",
  },
  buttons: {
    submitLogin: "Log in",
    submitRegister: "Sign up",
    loading: "…",
  },
} as const;

export type AuthDictEn = typeof authDict;
