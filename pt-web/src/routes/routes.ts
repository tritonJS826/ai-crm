export const PATHS = {
  HOME: "/",
  ABOUT: "/about",
  CONDITIONS: {LIST: "/conditions", DETAIL: "/conditions/:id"},
  TESTS: {LIST: "/tests", DETAIL: "/tests/:id"},
  BIOHACKING: {LIST: "/biohacking", DETAIL: "/biohacking/:id"},
  SOS: {PAGE: "/sos", CONSULTATION: "/sos/consultation"},
  PROFILE: {PAGE: "/profile", CONDITION: "/profile/condition/:id"},
  AUTH: {PAGE: "/auth"},
  NOT_FOUND: "*",
} as const;

export const buildPath = {
  conditionsList: () => PATHS.CONDITIONS.LIST,
  testsList: () => PATHS.TESTS.LIST,
  biohackingList: () => PATHS.BIOHACKING.LIST,
  sosList: () => PATHS.SOS.PAGE,

  conditionsDetail: (id: string | number) => `/conditions/${id}`,
  testsDetail: (id: string | number) => `/tests/${id}`,
  biohackingDetail: (id: string | number) => `/biohacking/${id}`,

  supportConsultation: () => PATHS.SOS.CONSULTATION,
  about: () => PATHS.ABOUT,

  profilePage: () => PATHS.PROFILE.PAGE,
  profileCondition: (id: string | number) => `/profile/condition/${id}`,

  auth: () => PATHS.AUTH.PAGE,

} as const;
