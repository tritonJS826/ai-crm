export const PATHS = {
  HOME: "/",
  ABOUT: "/about",
  PROFILE: {PAGE: "/profile"},
  AUTH: {PAGE: "/auth"},
  PAYMENT_SUCCESS: "/payment-success",
  CHAT: "/chat",
  NOT_FOUND: "*",
} as const;

export const buildPath = {
  about: () => PATHS.ABOUT,

  profilePage: () => PATHS.PROFILE.PAGE,

  auth: () => PATHS.AUTH.PAGE,

} as const;
