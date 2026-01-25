import {env} from "src/utils/env/env";

export const API_ROUTES = {
  LOGIN: (): string => `${env.API_BASE_PATH}/br-general/auth/login/full`,
  LOGOUT: (): string => `${env.API_BASE_PATH}/br-general/auth/logout`,
  REFRESH: (): string => `${env.API_BASE_PATH}/br-general/auth/refresh`,
  REGISTER: (): string => `${env.API_BASE_PATH}/br-general/auth/register`,
  USERS_ME: (): string => `${env.API_BASE_PATH}/br-general/users/me`,
} as const;
